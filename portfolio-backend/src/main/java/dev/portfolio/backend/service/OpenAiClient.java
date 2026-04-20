package dev.portfolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.portfolio.backend.config.AssistantProperties;
import dev.portfolio.backend.error.AssistantUnavailableException;
import dev.portfolio.backend.error.AssistantUpstreamException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
@RequiredArgsConstructor
public class OpenAiClient {
  private static final String OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

  private final AssistantProperties properties;
  private final ObjectMapper objectMapper;

  public String ask(String systemPrompt, String userPrompt) {
    if (!properties.isEnabled()) {
      throw new AssistantUnavailableException("El asistente IA está deshabilitado.");
    }
    if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
      throw new AssistantUnavailableException("Falta configurar OPENAI_API_KEY en el backend.");
    }

    RestClient client = buildRestClient();
    Map<String, Object> payload =
        Map.of(
            "model", properties.getModel(),
            "messages",
                List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)),
            "temperature", properties.getTemperature(),
            "max_tokens", properties.getMaxTokens());

    try {
      String raw =
          client
              .post()
              .uri(OPENAI_CHAT_URL)
              .header("Authorization", "Bearer " + properties.getApiKey())
              .body(payload)
              .retrieve()
              .body(String.class);
      return extractAnswer(raw);
    } catch (RestClientResponseException ex) {
      throw new AssistantUpstreamException("OpenAI respondió con error: " + ex.getStatusCode(), ex);
    } catch (Exception ex) {
      throw new AssistantUpstreamException("No se pudo consultar OpenAI.", ex);
    }
  }

  public String model() {
    return properties.getModel();
  }

  private RestClient buildRestClient() {
    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(properties.getTimeoutMs());
    requestFactory.setReadTimeout(properties.getTimeoutMs());
    return RestClient.builder().requestFactory(requestFactory).build();
  }

  private String extractAnswer(String raw) throws Exception {
    if (raw == null || raw.isBlank()) {
      throw new AssistantUpstreamException("OpenAI devolvió una respuesta vacía.", null);
    }
    JsonNode root = objectMapper.readTree(raw);
    JsonNode content = root.path("choices").path(0).path("message").path("content");
    if (content.isMissingNode() || content.asText().isBlank()) {
      throw new AssistantUpstreamException("OpenAI no devolvió contenido utilizable.", null);
    }
    return content.asText().trim();
  }
}
