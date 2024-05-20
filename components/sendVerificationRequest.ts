import { createTransport } from "nodemailer";
import { SendVerificationRequestParams } from "next-auth/providers/email";
import { Theme } from "next-auth";

export async function sendVerificationRequest(
  params: SendVerificationRequestParams
) {
  const { identifier, url, provider, theme } = params;
  const { host } = new URL(url);
  const transport = createTransport(provider.server);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `${host} 注册认证`,
    text: text({ url, host }),
    html: html({ url, host, theme }),
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

/**
 *使用HTML body 代替正文内容
 */
function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host } = params;
  //由于使用
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return `
<body>
  <div style="background:#f2f5f7;display: flex;justify-content: center;align-items: center; height:200px">欢迎注册${escapedHost},点击<a href="${url}" target="_blank">登录</a></div>
</body>
`;
}

/** 不支持HTML 的邮件客户端会显示下面的文本信息 */
function text({ url, host }: { url: string; host: string }) {
  return `欢迎注册 ${host}\n点击${url}登录\n\n`;
}
