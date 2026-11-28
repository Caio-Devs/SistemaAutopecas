// =====================================================================
// Usuário que está fazendo a operação.
// TEMPORÁRIO: enquanto o login não estiver pronto, todas as operações
// são feitas pelo usuário padrão (USUARIO_PADRAO_ID, normalmente o admin).
// Quando o login existir, este middleware deve ler o usuário da sessão
// e recusar quem não estiver logado.
// =====================================================================

function usuarioAtual(req, res, next) {
    req.usuario = req.usuario || { idUsuario: Number(process.env.USUARIO_PADRAO_ID) || 1 };
    next();
}

module.exports = { usuarioAtual };
