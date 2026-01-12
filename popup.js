document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetch-btn');
  const copyBtn = document.getElementById('copy-btn');
  const container = document.getElementById('cookie-container');
  const badge = document.getElementById('status-badge');

  // 小红书的主页 URL，用于匹配 Cookie
  const XHS_URL = "https://www.xiaohongshu.com/";
  const XHS_DOMAIN = "xiaohongshu.com";

  // Get Cookies
  fetchBtn.addEventListener('click', async () => {
    try {
      container.innerText = "正在获取数据...";
      
      // 使用 domain 和 url 组合查询，或者先尝试 url
      // chrome.cookies.getAll({ domain: XHS_DOMAIN }, ...) 有时候不够精确或漏掉子域
      // 使用 url 参数通常能获取到该页面能访问的所有 cookie
      chrome.cookies.getAll({ url: XHS_URL }, (cookies) => {
        if (chrome.runtime.lastError) {
          container.innerText = "获取失败: " + chrome.runtime.lastError.message;
          return;
        }

        if (!cookies || cookies.length === 0) {
          // 尝试用 domain 再查一次作为 fallback
          chrome.cookies.getAll({ domain: XHS_DOMAIN }, (domainCookies) => {
             if (chrome.runtime.lastError || !domainCookies || domainCookies.length === 0) {
                container.innerText = "未发现相关 Cookie。\n\n请确保：\n1. 您已在浏览器中打开并登录小红书 (xiaohongshu.com)\n2. 尝试刷新小红书页面后重试";
                badge.innerText = "未找到";
                badge.className = "px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded-full";
                copyBtn.disabled = true;
             } else {
                displayCookies(domainCookies);
             }
          });
          return;
        }

        displayCookies(cookies);
      });
    } catch (err) {
      container.innerText = "发生意外错误: " + err.message;
    }
  });

  function displayCookies(cookies) {
    // 过滤掉不需要的 cookie 可以在这里做，但通常全部获取
    // Format as key=value; pairs
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    container.innerText = cookieString;
    badge.innerText = `已获取 (${cookies.length})`;
    badge.className = "px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full";
    copyBtn.disabled = false;
  }

  // Copy to Clipboard
  copyBtn.addEventListener('click', () => {
    const text = container.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = "已复制!";
      setTimeout(() => {
        copyBtn.innerText = originalText;
      }, 2000);
    }).catch(err => {
      // Fallback for older browsers or if navigator.clipboard fails
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      
      const originalText = copyBtn.innerText;
      copyBtn.innerText = "已复制!";
      setTimeout(() => {
        copyBtn.innerText = originalText;
      }, 2000);
    });
  });
});
