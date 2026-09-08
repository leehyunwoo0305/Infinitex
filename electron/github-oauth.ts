import { ipcMain, shell, BrowserWindow } from 'electron';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

// GitHub OAuth 설정
const GITHUB_CLIENT_ID = 'Ov23liMnPnTvTwA11Nxj';
const GITHUB_CLIENT_SECRET = 'ac34761ab6312c6d80727693d9622897f1ebea23';
const REDIRECT_URI = 'http://localhost:3456/callback';
const SCOPE = 'read:user user:email';

function makeRequest(options: https.RequestOptions, postData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getAccessToken(code: string): Promise<string | null> {
  try {
    const postData = `client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    const data = await makeRequest({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    }, postData);

    return data.access_token || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

async function getGitHubUser(accessToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: '/user',
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'Infinitex-App',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getGitHubEmails(accessToken: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: '/user/emails',
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'Infinitex-App',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const emails = JSON.parse(data);
          const primaryEmail = emails.find((e: any) => e.primary && e.verified);
          resolve(primaryEmail?.email || emails[0]?.email || null);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export function setupGitHubOAuth() {
  let authWindow: BrowserWindow | null = null;
  let server: http.Server | null = null;

  ipcMain.handle('auth-github-login', async () => {
    return new Promise((resolve) => {
      // 로컬 서버 시작
      server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url || '', true);
        
        if (parsedUrl.pathname === '/callback') {
          const code = parsedUrl.query.code as string;
          
          if (code) {
            // 액세스 토큰 받기
            const accessToken = await getAccessToken(code);
            
            if (accessToken) {
              // 사용자 정보 받기
              const githubUser = await getGitHubUser(accessToken);
              const email = await getGitHubEmails(accessToken);
              
              // 성공 응답
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(`
                <html>
                <body>
                  <h1>로그인 성공!</h1>
                  <p>Infinitex로 돌아가세요.</p>
                  <script>window.close();</script>
                </body>
                </html>
              `);
              
              resolve({
                success: true,
                user: {
                  uid: `github_${githubUser.id}`,
                  email: email || `${githubUser.login}@github.local`,
                  displayName: githubUser.name || githubUser.login,
                  avatar: githubUser.avatar_url,
                  emailVerified: true,
                  provider: 'github',
                }
              });
            } else {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<h1>인증 실패</h1><p>토큰을 받지 못했습니다.</p>');
              resolve({ success: false, error: '토큰 획득 실패' });
            }
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>인증 실패</h1><p>코드가 없습니다.</p>');
            resolve({ success: false, error: '인증 코드 없음' });
          }
          
          // 서버 종료
          setTimeout(() => {
            server?.close();
            server = null;
          }, 1000);
        }
      });

      server.listen(3456, () => {
        // GitHub 인증 페이지 열기
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPE}`;
        shell.openExternal(authUrl);
      });

      server.on('error', (err) => {
        console.error('Server error:', err);
        resolve({ success: false, error: '서버 시작 실패' });
      });

      // 타임아웃 (5분)
      setTimeout(() => {
        if (server) {
          server.close();
          server = null;
          resolve({ success: false, error: '시간 초과' });
        }
      }, 5 * 60 * 1000);
    });
  });
}