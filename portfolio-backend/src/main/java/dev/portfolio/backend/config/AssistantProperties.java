package dev.portfolio.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "assistant.openai")
@Getter
@Setter
public class AssistantProperties {
  private boolean enabled = false;
  private String apiKey = "";
  private String model = "gpt-4o-mini";
  private int maxTokens = 350;
  private int timeoutMs = 12000;
  private double temperature = 0.3;
}
