export const config = {
    allowedEmails: ['eitankatzenell@gmail.com', 'yekelor@gmail.com'],
  } as const;
  
  export type AllowedEmail = (typeof config.allowedEmails)[number];