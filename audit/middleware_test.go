package audit

import (
	"encoding/json"
	"testing"

	"github.com/QuantumNous/new-api/dto"
)

func TestExtractPromptFromClaudeRequest_StringContent(t *testing.T) {
	req := &dto.ClaudeRequest{
		Messages: []dto.ClaudeMessage{
			{Role: "user", Content: "Hello, how are you?"},
		},
	}
	result := ExtractPromptFromRequest(req)
	if result != "Hello, how are you?" {
		t.Errorf("Expected 'Hello, how are you?', got '%s'", result)
	}
}

func TestExtractPromptFromClaudeRequest_ArrayContent(t *testing.T) {
	// Simulate what happens after JSON unmarshal — Content becomes []interface{}
	raw := `{
		"model": "claude-3-opus",
		"messages": [
			{
				"role": "user",
				"content": [
					{"type": "text", "text": "What is in this image?"},
					{"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": "abc"}}
				]
			}
		]
	}`
	var req dto.ClaudeRequest
	if err := json.Unmarshal([]byte(raw), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}
	result := ExtractPromptFromRequest(&req)
	if result != "What is in this image?" {
		t.Errorf("Expected 'What is in this image?', got '%s'", result)
	}
}

func TestExtractPromptFromClaudeRequest_ToolUseConversation(t *testing.T) {
	// Typical Claude tool-use conversation: user sends text, assistant responds with tool_use,
	// then user sends tool_result
	raw := `{
		"model": "claude-3-opus",
		"messages": [
			{
				"role": "user",
				"content": "What's the weather in Tokyo?"
			},
			{
				"role": "assistant",
				"content": [
					{"type": "tool_use", "id": "tu_1", "name": "get_weather", "input": {"city": "Tokyo"}}
				]
			},
			{
				"role": "user",
				"content": [
					{"type": "tool_result", "tool_use_id": "tu_1", "content": "Sunny, 25°C"}
				]
			}
		]
	}`
	var req dto.ClaudeRequest
	if err := json.Unmarshal([]byte(raw), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}
	result := ExtractPromptFromRequest(&req)
	// Should find first user message with text, or fall back to tool_result
	if result == "" {
		t.Errorf("Expected non-empty result for tool-use conversation, got empty")
	}
	t.Logf("Result: %s", result)
}

func TestExtractPromptFromClaudeRequest_OnlyToolResult(t *testing.T) {
	// Edge case: all user messages only have tool_result, no text
	raw := `{
		"model": "claude-3-opus",
		"messages": [
			{
				"role": "user",
				"content": [
					{"type": "tool_result", "tool_use_id": "tu_1", "content": "Result data here"}
				]
			}
		]
	}`
	var req dto.ClaudeRequest
	if err := json.Unmarshal([]byte(raw), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}
	result := ExtractPromptFromRequest(&req)
	if result == "" {
		t.Errorf("Expected tool_result fallback, got empty")
	}
	t.Logf("Result: %s", result)
}

func TestExtractPromptFromClaudeRequest_EmptyMessages(t *testing.T) {
	req := &dto.ClaudeRequest{
		Messages: []dto.ClaudeMessage{},
	}
	result := ExtractPromptFromRequest(req)
	if result != "" {
		t.Errorf("Expected empty, got '%s'", result)
	}
}

func TestExtractPromptFromClaudeRequest_MultipleUserMessages(t *testing.T) {
	// Should return the LAST user message with text
	raw := `{
		"model": "claude-3-opus",
		"messages": [
			{"role": "user", "content": "First question"},
			{"role": "assistant", "content": "First answer"},
			{"role": "user", "content": "Second question"}
		]
	}`
	var req dto.ClaudeRequest
	if err := json.Unmarshal([]byte(raw), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}
	result := ExtractPromptFromRequest(&req)
	if result != "Second question" {
		t.Errorf("Expected 'Second question', got '%s'", result)
	}
}

func TestExtractPromptFromClaudeRequest_MixedContentWithToolResult(t *testing.T) {
	// User message with both text and tool_result blocks
	raw := `{
		"model": "claude-3-opus",
		"messages": [
			{
				"role": "user",
				"content": [
					{"type": "tool_result", "tool_use_id": "tu_1", "content": "Weather data"},
					{"type": "text", "text": "Based on this, what should I wear?"}
				]
			}
		]
	}`
	var req dto.ClaudeRequest
	if err := json.Unmarshal([]byte(raw), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}
	result := ExtractPromptFromRequest(&req)
	if result != "Based on this, what should I wear?" {
		t.Errorf("Expected 'Based on this, what should I wear?', got '%s'", result)
	}
}

// Test with GeneralOpenAIRequest for comparison
func TestExtractPromptFromOpenAIRequest(t *testing.T) {
	req := &dto.GeneralOpenAIRequest{
		Messages: []dto.Message{
			{Role: "user", Content: json.RawMessage(`"Hello from OpenAI format"`)},
		},
	}
	result := ExtractPromptFromRequest(req)
	if result != "Hello from OpenAI format" {
		t.Errorf("Expected 'Hello from OpenAI format', got '%s'", result)
	}
}
