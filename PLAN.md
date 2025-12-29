# Plano: Implementação da Infraestrutura HTTP

## Análise do Estado Atual

### ✅ Já Implementado

**Domain Layer (src/domain/)**
- `Pool.ts` - Entidade Pool com interface bem definida
- `PoolRepo.ts` - Interface do repositório seguindo Dependency Inversion Principle
- `usePoolFindAll.ts` - Use case que consome o repository via Dependency Injection
- `Repositories.ts` - Interface agregando todos os repositórios

**Infrastructure Layer (src/infra/)**
- `RepositoryProvider.tsx` - React Context para injeção de dependência
- `useAppQuery.ts` - Wrapper customizado para React Query

### ⚠️ Faltando

- HTTP client (Axios) configurado
- Implementação concreta do `PoolRepo`
- Configuração de variáveis de ambiente
- Integração dos providers na raiz da aplicação
- Uso real da funcionalidade em alguma tela

---

## Próximos Passos

### 1. Instalar Dependências

**Comando:**
```bash
bun add axios
```

### 2. Configurar Variáveis de Ambiente

**Criar `.env` na raiz:**
```env
API_BASE_URL=<URL_DA_API>
```

**Criar `.env.example` (template para outros devs):**
```env
API_BASE_URL=https://api.example.com
```

**Verificar `.gitignore`:**
Garantir que `.env` está no gitignore (já deve estar por padrão no Expo)

### 3. Criar HTTP Client

**Arquivo:** `src/infra/http/apiClient.ts`

**Responsabilidades:**
- Criar instância configurada do Axios
- Base URL da API (via `expo-constants` para ler .env)
- Timeout padrão
- Headers padrão (Content-Type, etc)
- Interceptors para:
  - Log de requisições (development only)
  - Tratamento centralizado de erros
  - Transformação de responses

**Estrutura esperada:**
```typescript
import axios from 'axios';
import Constants from 'expo-constants';

const apiClient = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para request/response
export { apiClient };
```

### 4. Implementar Repository Concreto

**Arquivo:** `src/infra/repositories/pool/PoolRepoImpl.ts`

**Responsabilidades:**
- Implementar a interface `PoolRepo` do domain
- Usar `apiClient` para fazer chamadas HTTP
- Mapear DTOs da API para entidades do domain (`Pool`)
- Tratar erros e lançar exceções adequadas

**Padrão Clean Architecture:**
```typescript
import { Pool } from '@/domain/pool/Pool';
import { PoolRepo } from '@/domain/pool/PoolRepo';
import { apiClient } from '@/infra/http/apiClient';

export class PoolRepoImpl implements PoolRepo {
  async findAll(): Promise<Pool[]> {
    const response = await apiClient.get('/pools');
    return response.data; // ou mapear se necessário
  }
}
```

### 5. Configurar Providers na Raiz

**Arquivo:** `src/app/_layout.tsx`

**Modificações:**
1. Criar `QueryClient` do React Query
2. Instanciar repositórios concretos
3. Envolver app com providers necessários:
   - `QueryClientProvider`
   - `RepositoryProvider`

**Estrutura esperada:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepositoryProvider } from '@/infra/repositories/RepositoryProvider';
import { PoolRepoImpl } from '@/infra/repositories/pool/PoolRepoImpl';

const queryClient = new QueryClient();

const repositories = {
  poolRepo: new PoolRepoImpl(),
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider value={repositories}>
        <Stack />
        <PortalHost />
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
```

### 6. Atualizar app.json para Variáveis de Ambiente

**Arquivo:** `app.json`

Adicionar em `expo.extra`:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": process.env.API_BASE_URL,
      "eas": {
        "projectId": "5a85ba39-4794-462c-91b7-1ddc9b59e1c9"
      }
    }
  }
}
```

### 7. Testar Integração

**Arquivo:** `src/app/index.tsx`

**Implementar:**
- Usar `usePoolFindAll()` hook
- Renderizar estados: loading, error, success
- Exibir lista de pools

**Exemplo:**
```typescript
import { usePoolFindAll } from '@/domain/pool/useCases/usePoolFindAll';

export default function Index() {
  const { data, isLoading, error } = usePoolFindAll();

  if (isLoading) return <Text>Carregando pools...</Text>;
  if (error) return <Text>Erro ao carregar pools</Text>;

  return (
    <View>
      {data?.map(pool => (
        <Text key={pool.id}>{pool.symbol} - {pool.apy}%</Text>
      ))}
    </View>
  );
}
```

---

## Estrutura de Diretórios Final

```
src/
├── domain/
│   ├── Repositories.ts
│   └── pool/
│       ├── Pool.ts
│       ├── PoolRepo.ts
│       └── useCases/
│           └── usePoolFindAll.ts
├── infra/
│   ├── http/
│   │   └── apiClient.ts               [NOVO]
│   ├── repositories/
│   │   ├── RepositoryProvider.tsx
│   │   └── pool/
│   │       └── PoolRepoImpl.ts        [NOVO]
│   └── useCases/
│       └── useAppQuery.ts
└── app/
    ├── _layout.tsx                     [MODIFICAR]
    └── index.tsx                       [MODIFICAR]
```

---

## Princípios de Clean Architecture Mantidos

1. **Dependency Inversion**: Domain não conhece Infra
   - `PoolRepo` é uma interface no domain
   - `PoolRepoImpl` implementa no infra

2. **Separation of Concerns**:
   - Domain: Regras de negócio e entidades
   - Infra: Implementação técnica (HTTP, storage, etc)
   - Presentation: UI e state management

3. **Dependency Injection**:
   - Repositórios injetados via Context
   - Fácil trocar implementações (mock, real API, etc)

4. **Single Responsibility**:
   - `apiClient`: Apenas configuração HTTP
   - `PoolRepoImpl`: Apenas chamadas relacionadas a Pool
   - `usePoolFindAll`: Apenas orquestração do use case

---

## Checklist de Implementação

- [ ] Instalar axios
- [ ] Criar `.env` e `.env.example`
- [ ] Criar `src/infra/http/apiClient.ts`
- [ ] Criar `src/infra/repositories/pool/PoolRepoImpl.ts`
- [ ] Atualizar `app.json` com variáveis de ambiente
- [ ] Atualizar `src/app/_layout.tsx` com providers
- [ ] Testar em `src/app/index.tsx`
- [ ] Verificar que tudo está funcionando
- [ ] Fazer commit das mudanças

---

## Observações

- A URL da API deve ser informada no arquivo `.env`
- API não requer autenticação (conforme confirmado)
- Seguir os padrões já estabelecidos no projeto
- Manter consistência com a arquitetura existente
