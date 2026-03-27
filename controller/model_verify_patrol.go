package controller

import (
	"fmt"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
)

// ==================== 模型鉴真自动巡检 ====================
// 定期检测开启了 auto_verify 的渠道，掺假自动禁用，恢复自动启用

const (
	DefaultVerifyInterval = 5 * time.Minute // 默认巡检间隔
	VerifyScoreThreshold  = 70              // 低于此分数视为掺假
	MaxConsecutiveFails   = 2               // 连续检测失败N次才禁用（网络等错误不算掺假）
	PatrolScanInterval    = 1 * time.Minute // 巡检扫描频率
)

// 跟踪每个渠道的连续失败次数
var (
	verifyFailCounts   = make(map[int]int)
	verifyFailCountsMu sync.Mutex
)

var autoVerifyOnce sync.Once

// StartAutoVerifyPatrol 启动自动鉴真巡检（在 main 中调用）
func StartAutoVerifyPatrol() {
	if !common.IsMasterNode {
		return
	}
	autoVerifyOnce.Do(func() {
		go runVerifyPatrol()
	})
}

func runVerifyPatrol() {
	common.SysLog("模型鉴真巡检引擎已启动")
	for {
		time.Sleep(PatrolScanInterval)
		patrolOnce()
	}
}

func patrolOnce() {
	// 获取所有需要巡检的渠道
	channels, err := model.GetAutoVerifyChannels()
	if err != nil {
		common.SysError(fmt.Sprintf("鉴真巡检获取渠道失败: %v", err))
		return
	}

	if len(channels) == 0 {
		return
	}

	now := time.Now().Unix()

	for _, channel := range channels {
		// 检查是否到了巡检时间
		interval := int64(DefaultVerifyInterval.Seconds())
		if channel.LastVerifyTime > 0 && now-channel.LastVerifyTime < interval {
			continue
		}

		// 获取检测模型
		verifyModel := channel.GetVerifyModel()
		if verifyModel == "" {
			common.SysLog(fmt.Sprintf("渠道 #%d [%s] 无可用模型，跳过鉴真", channel.Id, channel.Name))
			continue
		}

		// 执行检测
		common.SysLog(fmt.Sprintf("鉴真巡检: 渠道 #%d [%s] 模型 %s", channel.Id, channel.Name, verifyModel))
		result := executeVerify(&channel, verifyModel)

		// 更新检测时间和分数
		model.UpdateChannelVerifyResult(channel.Id, int(time.Now().Unix()), result.Score)

		if !result.Success {
			// 检测本身失败（网络错误等），不算掺假
			common.SysLog(fmt.Sprintf("鉴真巡检: 渠道 #%d [%s] 检测失败（非掺假）: %s", channel.Id, channel.Name, result.Error))
			continue
		}

		// 根据分数和渠道状态决定动作
		if channel.Status == common.ChannelStatusEnabled {
			// 渠道正常启用中
			if result.Score < VerifyScoreThreshold {
				// 分数过低，增加失败计数
				verifyFailCountsMu.Lock()
				verifyFailCounts[channel.Id]++
				consecutiveFails := verifyFailCounts[channel.Id]
				verifyFailCountsMu.Unlock()

				if consecutiveFails >= MaxConsecutiveFails {
					// 连续N次掺假，自动禁用
					disableChannelByVerify(channel.Id, channel.Name, result.Score, verifyModel)
					verifyFailCountsMu.Lock()
					verifyFailCounts[channel.Id] = 0
					verifyFailCountsMu.Unlock()
				} else {
					common.SysLog(fmt.Sprintf("鉴真巡检: 渠道 #%d [%s] 分数 %d 低于阈值，连续第 %d 次（需 %d 次禁用）",
						channel.Id, channel.Name, result.Score, consecutiveFails, MaxConsecutiveFails))
				}
			} else {
				// 检测通过，重置失败计数
				verifyFailCountsMu.Lock()
				verifyFailCounts[channel.Id] = 0
				verifyFailCountsMu.Unlock()
			}
		} else if channel.Status == common.ChannelStatusVerifyDisabled {
			// 渠道被鉴真禁用中
			if result.Score >= VerifyScoreThreshold {
				// 检测通过，自动恢复
				enableChannelByVerify(channel.Id, channel.Name, result.Score, verifyModel)
				verifyFailCountsMu.Lock()
				verifyFailCounts[channel.Id] = 0
				verifyFailCountsMu.Unlock()
			} else {
				common.SysLog(fmt.Sprintf("鉴真巡检: 渠道 #%d [%s] 仍为假（分数 %d），保持禁用", channel.Id, channel.Name, result.Score))
			}
		}

		// 每次检测后等待一下，避免请求过密
		time.Sleep(3 * time.Second)
	}
}

// disableChannelByVerify 鉴真禁用渠道
func disableChannelByVerify(channelId int, channelName string, score int, verifyModel string) {
	success := model.UpdateChannelStatus(channelId, "", common.ChannelStatusVerifyDisabled, "")
	if success {
		msg := fmt.Sprintf("🔴 鉴真巡检禁用渠道「%s」(#%d)\n模型: %s\n分数: %d（阈值 %d）\n原因: 连续 %d 次检测不通过",
			channelName, channelId, verifyModel, score, VerifyScoreThreshold, MaxConsecutiveFails)
		common.SysLog(msg)
		service.NotifyRootUser("verify_disable", "鉴真自动禁用: "+channelName, msg)
	}
}

// enableChannelByVerify 鉴真恢复渠道
func enableChannelByVerify(channelId int, channelName string, score int, verifyModel string) {
	success := model.UpdateChannelStatus(channelId, "", common.ChannelStatusEnabled, "")
	if success {
		msg := fmt.Sprintf("🟢 鉴真巡检恢复渠道「%s」(#%d)\n模型: %s\n分数: %d（阈值 %d）",
			channelName, channelId, verifyModel, score, VerifyScoreThreshold)
		common.SysLog(msg)
		service.NotifyRootUser("verify_enable", "鉴真自动恢复: "+channelName, msg)
	}
}
