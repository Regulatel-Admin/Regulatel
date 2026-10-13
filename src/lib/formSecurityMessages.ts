/** Copy for the protected public forms, kept separate from existing site translations. */
const es = {
  loading: "Cargando verificación de seguridad…",
  verifying: "Completa la verificación para continuar.",
  ready: "Verificación completada.",
  loadError: "No pudimos cargar la verificación. Vuelve a intentarlo.",
  expired: "La verificación expiró. Actualízala para continuar.",
  verificationError: "No pudimos completar la verificación. Vuelve a intentarlo.",
  retry: "Actualizar verificación",
  required: "Completa la verificación de seguridad antes de enviar.",
  invalidFields: "Revisa los campos obligatorios y escribe un correo válido.",
  subscriptionPending: "Si corresponde, recibirás un correo para confirmar tu suscripción. Revisa también el correo no deseado.",
  confirmTitle: "Confirma tu suscripción",
  confirmDescription: "Pulsa el botón para confirmar que deseas recibir las novedades de REGULATEL.",
  confirmButton: "Confirmar mi suscripción",
  confirming: "Confirmando…",
  confirmSuccess: "Tu suscripción está confirmada. Gracias por seguir a REGULATEL.",
  confirmMissing: "Este enlace de confirmación no es válido. Solicita uno nuevo desde la página de suscripción.",
  confirmError: "No pudimos confirmar tu suscripción. El enlace puede haber expirado; solicita uno nuevo.",
  confirmBack: "Volver a suscripción",
};

type FormSecurityMessages = typeof es;

const en: FormSecurityMessages = {
  loading: "Loading security verification…",
  verifying: "Complete the verification to continue.",
  ready: "Verification completed.",
  loadError: "We could not load the verification. Please try again.",
  expired: "The verification expired. Refresh it to continue.",
  verificationError: "We could not complete the verification. Please try again.",
  retry: "Refresh verification",
  required: "Complete the security verification before submitting.",
  invalidFields: "Check the required fields and enter a valid email address.",
  subscriptionPending: "If applicable, you will receive an email to confirm your subscription. Please also check your spam folder.",
  confirmTitle: "Confirm your subscription",
  confirmDescription: "Press the button to confirm that you want to receive news from REGULATEL.",
  confirmButton: "Confirm my subscription",
  confirming: "Confirming…",
  confirmSuccess: "Your subscription is confirmed. Thank you for following REGULATEL.",
  confirmMissing: "This confirmation link is invalid. Request a new one on the subscription page.",
  confirmError: "We could not confirm your subscription. The link may have expired; please request a new one.",
  confirmBack: "Back to subscription",
};

const pt: FormSecurityMessages = {
  loading: "Carregando verificação de segurança…",
  verifying: "Conclua a verificação para continuar.",
  ready: "Verificação concluída.",
  loadError: "Não foi possível carregar a verificação. Tente novamente.",
  expired: "A verificação expirou. Atualize-a para continuar.",
  verificationError: "Não foi possível concluir a verificação. Tente novamente.",
  retry: "Atualizar verificação",
  required: "Conclua a verificação de segurança antes de enviar.",
  invalidFields: "Revise os campos obrigatórios e informe um e-mail válido.",
  subscriptionPending: "Se necessário, você receberá um e-mail para confirmar sua inscrição. Verifique também a pasta de spam.",
  confirmTitle: "Confirme sua inscrição",
  confirmDescription: "Clique no botão para confirmar que deseja receber as novidades do REGULATEL.",
  confirmButton: "Confirmar minha inscrição",
  confirming: "Confirmando…",
  confirmSuccess: "Sua inscrição está confirmada. Obrigado por acompanhar o REGULATEL.",
  confirmMissing: "Este link de confirmação é inválido. Solicite um novo na página de inscrição.",
  confirmError: "Não foi possível confirmar sua inscrição. O link pode ter expirado; solicite um novo.",
  confirmBack: "Voltar à inscrição",
};

const it: FormSecurityMessages = {
  loading: "Caricamento della verifica di sicurezza…",
  verifying: "Completa la verifica per continuare.",
  ready: "Verifica completata.",
  loadError: "Non è stato possibile caricare la verifica. Riprova.",
  expired: "La verifica è scaduta. Aggiornala per continuare.",
  verificationError: "Non è stato possibile completare la verifica. Riprova.",
  retry: "Aggiorna verifica",
  required: "Completa la verifica di sicurezza prima di inviare.",
  invalidFields: "Controlla i campi obbligatori e inserisci un indirizzo email valido.",
  subscriptionPending: "Se necessario, riceverai un'email per confermare l'iscrizione. Controlla anche la cartella spam.",
  confirmTitle: "Conferma la tua iscrizione",
  confirmDescription: "Premi il pulsante per confermare che desideri ricevere le novità di REGULATEL.",
  confirmButton: "Conferma la mia iscrizione",
  confirming: "Conferma in corso…",
  confirmSuccess: "La tua iscrizione è confermata. Grazie per seguire REGULATEL.",
  confirmMissing: "Questo link di conferma non è valido. Richiedine uno nuovo dalla pagina di iscrizione.",
  confirmError: "Non è stato possibile confermare l'iscrizione. Il link potrebbe essere scaduto; richiedine uno nuovo.",
  confirmBack: "Torna all'iscrizione",
};

export function formSecurityMessages(language: string): FormSecurityMessages {
  const locale = language.split("-")[0];
  return locale === "en" ? en : locale === "pt" ? pt : locale === "it" ? it : es;
}
