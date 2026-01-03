Instruções rápidas para deploy no Discloud

Resumo:
- Este diretório (`site novo`) contém uma cópia do projeto preparada para deploy.
- O servidor Node serve o frontend `dist/` e o backend a partir de `server.js` numa única porta.

Passos para deploy no Discloud:
1. No painel Discloud → Apps → Novo App → enviar este repositório (ou branch).
2. Defina as Variáveis de Ambiente no painel (essenciais):
   - `NODE_ENV=production`
   - `PORT=8080` (opcional; Discloud fornece porta)
   - `FRONTEND_URL=https://brasilsimracing.discloud.app`
   - `SESSION_SECRET=<uma-senha-segura>`
   - `STEAM_API_KEY=<sua-steam-api-key>` (se usar autenticação Steam)
   - `ADMIN_USERS=<lista_de_admins>`
3. Comando de instalação/Deploy: o `postinstall` já roda `npm run build`, então apenas `npm install` e `npm start` são suficientes. Use `npm start` como comando de inicialização.

Notas de robustez já aplicadas:
- `package.json` contém `postinstall: "npm run build"` para gerar `dist` durante o deploy.
- `server.js` protege as chamadas `setupWithHttpServer` e `startUdpListener` com `try/catch` para evitar falhas na inicialização.
- `assettoCorsaUdpService` agora trata `EADDRINUSE` ao tentar bind em UDP, registrando o problema sem encerrar o processo.

Teste local (opcional):
```bash
# instalar dependências
npm install
# construir frontend
npm run build
# iniciar server
NODE_ENV=production npm start
# testar health
curl http://localhost:8080/ping
```

Se precisar, eu posso:
- Ajustar as portas UDP por corrida via endpoint administrativo.
- Alterar o comportamento de fallback de bind para tentar portas alternativas automaticamente.
- Verificar os logs do último deploy na Discloud.
