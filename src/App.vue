<template>
  <div class="container">
    <div class="connection-status" :class="{ connected: isConnected }">
      {{ connectionStatus }}
      <span v-if="reconnectAttempts > 0">
        (Tentando reconectar {{ reconnectAttempts }}/{{ maxReconnectAttempts }})
      </span>
    </div>

    <div class="message-form">
      <textarea
        v-model="message"
        placeholder="Digite sua mensagem"
        :disabled="!isConnected"
        @keyup.enter="sendMessage"
      ></textarea>
      <button @click="sendMessage" :disabled="!isConnected || !message.trim()">
        Enviar Mensagem
      </button>
    </div>

    <div class="message-list">
      <h2>Mensagens <span class="badge">{{ messages.length }}</span></h2>
      <div v-if="loading" class="loading-message">Carregando mensagens...</div>
      <div v-else-if="messages.length === 0" class="empty-message">
        Nenhuma mensagem recebida ainda
      </div>
      <transition-group name="message-fade" tag="div" class="messages-container">
        <div v-for="(msg, index) in messages" :key="index" class="message-item">
          <div class="message-content">{{ msg.message }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      message: "",
      messages: [],
      socket: null,
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      loading: true,
      reconnectTimer: null,
      pingInterval: null,
    };
  },
  computed: {
    connectionStatus() {
      return this.isConnected ? "🟢 Conectado" : "🔴 Desconectado";
    },
  },
  methods: {
    async sendMessage() {
      if (!this.message.trim() || !this.isConnected) return;

      try {
        const response = await axios.post("/api/send", {
          message: this.message,
          timestamp: new Date().toISOString(),
        });

        if (response.data.status === "Mensagem enviada!") {
          this.message = "";
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        if (error.response?.status === 500) {
          this.handleConnectionError();
        }
      }
    },

    setupWebSocket() {
      if (this.socket) {
        this.socket.close();
        clearInterval(this.pingInterval);
      }

      const isDocker = window.location.hostname !== "localhost";
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = isDocker ? `${window.location.hostname}:3000` : "localhost:3000";
      const socketUrl = `${wsProtocol}//${wsHost}/ws`;

      console.log("Conectando ao WebSocket:", socketUrl);
      this.socket = new WebSocket(socketUrl);

      this.socket.onopen = () => {
        console.log("Conexão WebSocket estabelecida");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.loading = false;

        this.pingInterval = setInterval(() => {
          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: "PING" }));
          }
        }, 30000);

        this.socket.send(
          JSON.stringify({
            type: "GET_INITIAL_MESSAGES",
            token: localStorage.getItem("authToken") || "",
          })
        );
      };

      this.socket.onmessage = (event) => {
        try {
          const messageData = event.data;
          if (!messageData.startsWith("{") && !messageData.startsWith("[")) return;

          const parsedData = JSON.parse(messageData);
          const { type, data, status } = parsedData;

          if (type === "INITIAL_MESSAGES" && status === "success") {
            this.messages = data;
          } else if (type === "NEW_MESSAGE") {
            this.messages.unshift(data);
          }
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error, event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
        this.handleConnectionError();
      };

      this.socket.onclose = (event) => {
        console.log(`Conexão fechada. Código: ${event.code}, Razão: ${event.reason}`);
        this.handleConnectionError();
      };
    },

    handleConnectionError() {
      this.isConnected = false;
      clearInterval(this.pingInterval);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectAttempts * this.reconnectDelay, 10000);

        console.log(
          `Tentando reconectar em ${delay / 1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.setupWebSocket();
        }, delay);
      }
    },

    formatTime(isoString) {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
  },

  mounted() {
    this.setupWebSocket();
    window.addEventListener("focus", this.setupWebSocket);
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
    clearInterval(this.pingInterval);
    clearTimeout(this.reconnectTimer);
    window.removeEventListener("focus", this.setupWebSocket);
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.connection-status {
  padding: 8px 12px;
  margin-bottom: 20px;
  border-radius: 20px;
  background: #ff6b6b;
  color: white;
  font-size: 0.9em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.connection-status.connected {
  background: #51cf66;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

textarea {
  width: 100%;
  min-height: 60px;
  resize: none;
  padding: 10px;
  border-radius: 8px;
}

button {
  padding: 10px;
  border: none;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
}

.messages-container {
  display: flex;
  flex-direction: column-reverse;
}

.message-item {
  background: #f1f1f1;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}

@media (max-width: 600px) {
  .container {
    padding: 10px;
  }
}
</style>
