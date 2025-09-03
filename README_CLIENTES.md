# 🚀 AuthX API - Guia Rápido para Desenvolvedores

## ⚡ Início Rápido

### 1. Obtenha suas credenciais
```bash
# No painel administrativo da AuthX, você receberá:
APP_ID="seu-app-id-aqui"
PUBLIC_KEY="sua-chave-publica-aqui"
```

### 2. Configure os headers
```javascript
const headers = {
  'app-id': APP_ID,
  'public-key': PUBLIC_KEY,
  'Content-Type': 'application/json'
};
```

### 3. Teste a API
```bash
curl -X POST https://sua-api.com/v1/auth/create \
  -H "app-id: $APP_ID" \
  -H "public-key: $PUBLIC_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@exemplo.com","password":"12345678"}'
```

---

## 📚 Documentação Completa

- 📖 **[Documentação Completa](API_DOCUMENTATION.md)** - Guia detalhado com exemplos
- 🔧 **[OpenAPI Spec](API_OPENAPI.yaml)** - Especificação técnica para ferramentas
- 🎯 **[Exemplos de Código](#exemplos-de-código)** - Implementações em diferentes linguagens

---

## 🎯 Exemplos de Código

### JavaScript/Node.js
```javascript
const axios = require('axios');

class AuthXClient {
  constructor(appId, publicKey, baseUrl = 'https://sua-api.com') {
    this.appId = appId;
    this.publicKey = publicKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'app-id': appId,
      'public-key': publicKey,
      'Content-Type': 'application/json'
    };
  }

  async createUser(userData) {
    const response = await axios.post(`${this.baseUrl}/v1/auth/create`, userData, {
      headers: this.headers
    });
    return response.data;
  }

  async login(email, password) {
    const response = await axios.post(`${this.baseUrl}/v1/auth/login`, {
      email, password
    }, { headers: this.headers });
    return response.data;
  }

  async getUserData(token) {
    const response = await axios.get(`${this.baseUrl}/v1/token`, {
      headers: { ...this.headers, 'jwt': token }
    });
    return response.data;
  }
}

// Uso
const client = new AuthXClient('seu-app-id', 'sua-chave-publica');
const user = await client.createUser({
  name: 'João Silva',
  email: 'joao@exemplo.com',
  password: 'minhasenha123'
});
```

### Python
```python
import requests
from typing import Dict, Optional

class AuthXClient:
    def __init__(self, app_id: str, public_key: str, base_url: str = 'https://sua-api.com'):
        self.app_id = app_id
        self.public_key = public_key
        self.base_url = base_url
        self.headers = {
            'app-id': app_id,
            'public-key': public_key,
            'Content-Type': 'application/json'
        }
    
    def create_user(self, user_data: Dict) -> Dict:
        response = requests.post(f'{self.base_url}/v1/auth/create', 
                               json=user_data, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def login(self, email: str, password: str) -> Dict:
        response = requests.post(f'{self.base_url}/v1/auth/login',
                               json={'email': email, 'password': password},
                               headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_user_data(self, token: str) -> Dict:
        headers = {**self.headers, 'jwt': token}
        response = requests.get(f'{self.base_url}/v1/token', headers=headers)
        response.raise_for_status()
        return response.json()

# Uso
client = AuthXClient('seu-app-id', 'sua-chave-publica')
user = client.create_user({
    'name': 'João Silva',
    'email': 'joao@exemplo.com',
    'password': 'minhasenha123'
})
```

### PHP
```php
<?php
class AuthXClient {
    private $appId;
    private $publicKey;
    private $baseUrl;
    
    public function __construct($appId, $publicKey, $baseUrl = 'https://sua-api.com') {
        $this->appId = $appId;
        $this->publicKey = $publicKey;
        $this->baseUrl = $baseUrl;
    }
    
    private function getHeaders($includeJwt = false, $jwt = null) {
        $headers = [
            'app-id: ' . $this->appId,
            'public-key: ' . $this->publicKey,
            'Content-Type: application/json'
        ];
        
        if ($includeJwt && $jwt) {
            $headers[] = 'jwt: ' . $jwt;
        }
        
        return $headers;
    }
    
    public function createUser($userData) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v1/auth/create');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($userData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->getHeaders());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function login($email, $password) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v1/auth/login');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->getHeaders());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function getUserData($token) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v1/token');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->getHeaders(true, $token));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Uso
$client = new AuthXClient('seu-app-id', 'sua-chave-publica');
$user = $client->createUser([
    'name' => 'João Silva',
    'email' => 'joao@exemplo.com',
    'password' => 'minhasenha123'
]);
?>
```

### cURL (Bash)
```bash
#!/bin/bash

APP_ID="seu-app-id"
PUBLIC_KEY="sua-chave-publica"
BASE_URL="https://sua-api.com"

# Função para criar usuário
create_user() {
    local name="$1"
    local email="$2"
    local password="$3"
    
    curl -X POST "$BASE_URL/v1/auth/create" \
        -H "app-id: $APP_ID" \
        -H "public-key: $PUBLIC_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$password\"}"
}

# Função para login
login() {
    local email="$1"
    local password="$2"
    
    curl -X POST "$BASE_URL/v1/auth/login" \
        -H "app-id: $APP_ID" \
        -H "public-key: $PUBLIC_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}"
}

# Função para obter dados do usuário
get_user_data() {
    local token="$1"
    
    curl -X GET "$BASE_URL/v1/token" \
        -H "app-id: $APP_ID" \
        -H "public-key: $PUBLIC_KEY" \
        -H "jwt: $token"
}

# Exemplo de uso
create_user "João Silva" "joao@exemplo.com" "minhasenha123"
```

---

## 🔧 Ferramentas de Desenvolvimento

### Postman Collection
```json
{
  "info": {
    "name": "AuthX API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://sua-api.com"
    },
    {
      "key": "appId",
      "value": "seu-app-id"
    },
    {
      "key": "publicKey",
      "value": "sua-chave-publica"
    }
  ],
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "app-id",
            "value": "{{appId}}"
          },
          {
            "key": "public-key",
            "value": "{{publicKey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"João Silva\",\n  \"email\": \"joao@exemplo.com\",\n  \"password\": \"minhasenha123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/v1/auth/create",
          "host": ["{{baseUrl}}"],
          "path": ["v1", "auth", "create"]
        }
      }
    }
  ]
}
```

### Insomnia Collection
```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "2024-01-15T10:30:00.000Z",
  "__export_source": "insomnia.desktop.app:v2023.5.8",
  "resources": [
    {
      "_id": "req_create_user",
      "parentId": "fld_authx",
      "modified": 1705312200000,
      "created": 1705312200000,
      "url": "{{ _.base_url }}/v1/auth/create",
      "name": "Create User",
      "description": "Criar um novo usuário",
      "method": "POST",
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"João Silva\",\n  \"email\": \"joao@exemplo.com\",\n  \"password\": \"minhasenha123\"\n}"
      },
      "headers": [
        {
          "name": "app-id",
          "value": "{{ _.app_id }}"
        },
        {
          "name": "public-key",
          "value": "{{ _.public_key }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "authentication": {},
      "parameters": [],
      "settingStoreCookies": true,
      "settingSendCookies": true,
      "settingDisableRenderRequestBody": false,
      "settingEncodeUrl": true,
      "settingRebuildPath": true,
      "settingFollowRedirects": "global",
      "_type": "request"
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Erros Comuns

#### 1. Headers Faltando
```json
{
  "error": "Missing or invalid public key in headers"
}
```
**Solução**: Verifique se os headers `app-id` e `public-key` estão sendo enviados.

#### 2. Rate Limit Excedido
```json
{
  "error": "Weekly request limit of 100 reached for free plan"
}
```
**Solução**: Aguarde o reset semanal ou faça upgrade do plano.

#### 3. Token Inválido
```json
{
  "error": "Invalid token"
}
```
**Solução**: Verifique se o token JWT está correto e não expirou (4 dias).

#### 4. Email Já Existe
```json
{
  "error": "User already exists with this email"
}
```
**Solução**: Use um email diferente ou faça login com o email existente.

---

## 📞 Suporte

- 📧 **Email**: suporte@authx.com
- 📚 **Docs**: [docs.authx.com](https://docs.authx.com)
- 🐛 **Issues**: [github.com/authx/issues](https://github.com/authx/issues)
- 💬 **Discord**: [discord.gg/authx](https://discord.gg/authx)

---

**© 2024 AuthX. Todos os direitos reservados.**
