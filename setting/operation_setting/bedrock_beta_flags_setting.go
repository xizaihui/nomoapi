package operation_setting

import (
	"strings"
	"sync"
)

// BedrockBetaFlagsSetting AWS Bedrock beta flags 配置
type BedrockBetaFlagsSetting struct {
	SupportedFlags   []string `json:"supported_flags"`
	UnsupportedFlags []string `json:"unsupported_flags"`
}

var (
	bedrockBetaFlagsCache BedrockBetaFlagsSetting
	bedrockBetaFlagsMutex sync.RWMutex
	bedrockBetaFlagsInit  bool
)

var DefaultBedrockBetaFlags = BedrockBetaFlagsSetting{
	SupportedFlags: []string{
		"computer-use-2025-01-24",
		"max-tokens-3-5-sonnet-2022-07-15",
		"messages-2023-12-15",
		"tools-2024-04-04",
		"tools-2024-05-16",
	},
	UnsupportedFlags: []string{
		"context-management",
		"prompt-caching-scope",
		"prompt-caching",
		"extended-thinking",
	},
}

func GetBedrockBetaFlagsSetting() BedrockBetaFlagsSetting {
	bedrockBetaFlagsMutex.RLock()
	if bedrockBetaFlagsInit {
		defer bedrockBetaFlagsMutex.RUnlock()
		return bedrockBetaFlagsCache
	}
	bedrockBetaFlagsMutex.RUnlock()
	
	// Return default if not initialized
	return DefaultBedrockBetaFlags
}

func UpdateBedrockBetaFlagsSetting(supported, unsupported string) error {
	setting := BedrockBetaFlagsSetting{
		SupportedFlags:   parseFlags(supported),
		UnsupportedFlags: parseFlags(unsupported),
	}
	
	bedrockBetaFlagsMutex.Lock()
	bedrockBetaFlagsCache = setting
	bedrockBetaFlagsInit = true
	bedrockBetaFlagsMutex.Unlock()
	
	return nil
}

func parseFlags(input string) []string {
	if input == "" {
		return []string{}
	}
	lines := strings.Split(input, "\n")
	var flags []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "#") {
			flags = append(flags, line)
		}
	}
	return flags
}

func IsBedrockSupportedBeta(beta string) bool {
	setting := GetBedrockBetaFlagsSetting()
	
	// Check unsupported list first
	for _, flag := range setting.UnsupportedFlags {
		if flag == beta {
			return false
		}
	}
	
	// Check supported list
	for _, flag := range setting.SupportedFlags {
		if flag == beta {
			return true
		}
	}
	
	// Unknown flags are rejected by default (conservative)
	return false
}
