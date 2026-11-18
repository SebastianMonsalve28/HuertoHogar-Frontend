package cl.duoc.huertohogar.web;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class ErrorHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
    String detalles = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> e.getField() + ": " + e.getDefaultMessage()).collect(Collectors.joining("; "));
    return ResponseEntity.badRequest().body(Map.of("error", detalles, "fecha", Instant.now().toString()));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> http(ResponseStatusException ex) {
    return ResponseEntity.status(ex.getStatusCode())
        .body(Map.of("error", ex.getReason() == null ? "Solicitud inválida" : ex.getReason()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, String>> integridad() {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Conflicto de datos. Revisa duplicados o registros relacionados."));
  }
}
