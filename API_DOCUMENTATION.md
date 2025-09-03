# 🔐 AuthX API - Documentação para Clientes

Bem-vindo à documentação da **AuthX API** - seu sistema de autenticação completo e seguro para aplicações.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Rate Limiting](#-rate-limiting)
- [Endpoints](#-endpoints)
  - [Criar Usuário](#criar-usuário)
  - [Login](#login)
  - [Obter Dados do Usuário](#obter-dados-do-usuário)
- [Códigos de Erro](#-códigos-de-erro)
- [Exemplos de Uso](#-exemplos-de-uso)

---

## 🌟 Visão Geral

A AuthX API oferece um sistema completo de autenticação com:

- ✅ **Criação de usuários** com validação de dados
- ✅ **Login seguro** com JWT tokens
- ✅ **Verificação de tokens** para autenticação
- ✅ **Rate limiting** baseado em planos
- ✅ **Headers de segurança** obrigatórios

**Base URL:** `https://sua-api.com`

---

## 🔑 Autenticação

Todas as rotas requerem **dois headers obrigatórios**:

| Header | Tipo | Descrição | Obrigatório |
|--------|------|-----------|-------------|
| `app-id` | string | ID único da sua aplicação | ✅ |
| `public-key` | string | Chave pública da sua aplicação | ✅ |

### Como obter suas credenciais:
1. Acesse o painel administrativo da AuthX
2. Crie uma nova aplicação
3. Copie o `app-id` e `public-key` fornecidos

---

## ⚡ Rate Limiting

Sua aplicação possui limites semanais baseados no plano:

| Plano | Limite Semanal | Custo por Operação |
|-------|----------------|-------------------|
| **Free** | 100 requests | GET: 0.4, LOGIN: 0.6, CREATE: 2, DELETE: 0.8 |
| **Basic** | 1.000 requests | |
| **Pro** | 10.000 requests | |

> 💡 **Dica:** O contador é resetado automaticamente a cada 7 dias.

---

## 🚀 Endpoints

### Criar Usuário

Cria um novo usuário no sistema de autenticação.

**Endpoint:** `POST /v1/auth/create`

#### Headers Obrigatórios
```http
app-id: seu-app-id-aqui
public-key: sua-chave-publica-aqui
Content-Type: application/json
```

#### Body (JSON)
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

#### Validações
- **name**: Obrigatório, mínimo 1 caractere
- **email**: Obrigatório, formato de email válido
- **password**: Obrigatório, mínimo 8 caracteres

#### Resposta de Sucesso (201)
```json
{
  "status": "success",
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resposta de Erro (400/409)
```json
{
  "error": "User already exists with this email"
}
```

---

### Login

Autentica um usuário existente e retorna um token JWT.

**Endpoint:** `POST /v1/auth/login`

#### Headers Obrigatórios
```http
app-id: seu-app-id-aqui
public-key: sua-chave-publica-aqui
Content-Type: application/json
```

#### Body (JSON)
```json
{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

#### Validações
- **email**: Obrigatório, formato de email válido
- **password**: Obrigatório, mínimo 8 caracteres

#### Resposta de Sucesso (200)
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resposta de Erro (401)
```json
{
  "error": "Invalid email or password"
}
```

---

### Obter Dados do Usuário

Retorna os dados do usuário autenticado usando o token JWT.

**Endpoint:** `GET /v1/token`

#### Headers Obrigatórios
```http
app-id: seu-app-id-aqui
public-key: sua-chave-publica-aqui
jwt: seu-token-jwt-aqui
```

#### Resposta de Sucesso (200)
```json
{
  "status": "success",
  "message": "Login successful",
  "token": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "email_verified": false,
    "is_active": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "last_login_at": "2024-01-15T14:20:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}
```

#### Resposta de Erro (401)
```json
{
  "error": "Invalid token"
}
```

---

## ❌ Códigos de Erro

| Código | Descrição | Solução |
|--------|-----------|---------|
| **400** | Bad Request | Verifique os dados enviados e headers obrigatórios |
| **401** | Unauthorized | Verifique suas credenciais (app-id, public-key, jwt) |
| **404** | Not Found | Usuário não encontrado |
| **409** | Conflict | Email já está em uso |
| **429** | Too Many Requests | Limite semanal atingido |

### Erros Comuns

#### Headers Faltando
```json
{
  "error": "Missing or invalid public key in headers"
}
```

#### Rate Limit Excedido
```json
{
  "error": "Weekly request limit of 100 reached for free plan"
}
```

#### Token Inválido
```json
{
  "error": "Invalid token"
}
```

---

## 💻 Exemplos de Uso

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'https://sua-api.com';
const APP_ID = 'seu-app-id';
const PUBLIC_KEY = 'sua-chave-publica';

// Headers padrão
const headers = {
  'app-id': APP_ID,
  'public-key': PUBLIC_KEY,
  'Content-Type': 'application/json'
};

// 1. Criar usuário
async function criarUsuario(dadosUsuario) {
  try {
    const response = await axios.post(`${API_BASE}/v1/auth/create`, dadosUsuario, { headers });
    console.log('Usuário criado:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Erro ao criar usuário:', error.response.data);
  }
}

// 2. Login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/v1/auth/login`, 
      { email, password }, 
      { headers }
    );
    console.log('Login realizado:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Erro no login:', error.response.data);
  }
}

// 3. Obter dados do usuário
async function obterDadosUsuario(token) {
  try {
    const response = await axios.get(`${API_BASE}/v1/token`, {
      headers: { ...headers, 'jwt': token }
    });
    console.log('Dados do usuário:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Erro ao obter dados:', error.response.data);
  }
}

// Exemplo de uso
async function exemplo() {
  // Criar usuário
  const tokenCriacao = await criarUsuario({
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'minhasenha123'
  });

  // Login
  const tokenLogin = await login('joao@exemplo.com', 'minhasenha123');

  // Obter dados
  const dadosUsuario = await obterDadosUsuario(tokenLogin);
}
```

### Python

```python
import requests

API_BASE = 'https://sua-api.com'
APP_ID = 'seu-app-id'
PUBLIC_KEY = 'sua-chave-publica'

headers = {
    'app-id': APP_ID,
    'public-key': PUBLIC_KEY,
    'Content-Type': 'application/json'
}

# 1. Criar usuário
def criar_usuario(dados_usuario):
    response = requests.post(f'{API_BASE}/v1/auth/create', 
                           json=dados_usuario, 
                           headers=headers)
    if response.status_code == 201:
        return response.json()['token']
    else:
        print(f'Erro: {response.json()}')
        return None

# 2. Login
def login(email, password):
    response = requests.post(f'{API_BASE}/v1/auth/login',
                           json={'email': email, 'password': password},
                           headers=headers)
    if response.status_code == 200:
        return response.json()['token']
    else:
        print(f'Erro: {response.json()}')
        return None

# 3. Obter dados do usuário
def obter_dados_usuario(token):
    headers_with_jwt = {**headers, 'jwt': token}
    response = requests.get(f'{API_BASE}/v1/token', headers=headers_with_jwt)
    if response.status_code == 200:
        return response.json()['token']
    else:
        print(f'Erro: {response.json()}')
        return None

# Exemplo de uso
if __name__ == '__main__':
    # Criar usuário
    token = criar_usuario({
        'name': 'João Silva',
        'email': 'joao@exemplo.com',
        'password': 'minhasenha123'
    })
    
    if token:
        # Obter dados
        dados = obter_dados_usuario(token)
        print(dados)
```

### cURL

```bash
# 1. Criar usuário
curl -X POST https://sua-api.com/v1/auth/create \
  -H "app-id: seu-app-id" \
  -H "public-key: sua-chave-publica" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "minhasenha123"
  }'

# 2. Login
curl -X POST https://sua-api.com/v1/auth/login \
  -H "app-id: seu-app-id" \
  -H "public-key: sua-chave-publica" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "minhasenha123"
  }'

# 3. Obter dados do usuário
curl -X GET https://sua-api.com/v1/token \
  -H "app-id: seu-app-id" \
  -H "public-key: sua-chave-publica" \
  -H "jwt: seu-token-jwt"
```

---

## 🔒 Segurança

### Tokens JWT
- **Expiração**: 4 dias
- **Algoritmo**: HS256
- **Uso**: Incluir no header `jwt` para autenticação

### Boas Práticas
1. **Nunca** exponha suas chaves públicas no frontend
2. **Sempre** use HTTPS em produção
3. **Valide** tokens no servidor antes de processar
4. **Monitore** seu uso de rate limiting
5. **Mantenha** senhas seguras (mínimo 8 caracteres)

---

## 📞 Suporte

Para dúvidas ou suporte técnico:

- 📧 **Email**: suporte@authx.com
- 📚 **Documentação**: [docs.authx.com](https://docs.authx.com)
- 🐛 **Bugs**: [github.com/authx/issues](https://github.com/authx/issues)

---

## 📄 Changelog

### v1.0.0 (2024-01-15)
- ✅ Implementação inicial da API
- ✅ Sistema de rate limiting semanal
- ✅ Autenticação JWT
- ✅ Validação de dados com Zod

---

**© 2024 AuthX. Todos os direitos reservados.**
