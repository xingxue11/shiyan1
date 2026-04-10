// API基础URL
const API_BASE_URL = '/api';

// 全局状态
let currentUser = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initKnowledgeFramework();
    initInteractiveTabs();
    initQuizTabs();
    initVideoPlayer();
    initAIChat();
    initLoginModule();
    checkLoginStatus();
});

// 导航按钮切换
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentModules = document.querySelectorAll('.content-module');

    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有active类
            navButtons.forEach(b => b.classList.remove('active'));
            contentModules.forEach(m => m.classList.remove('active'));

            // 添加当前active类
            this.classList.add('active');
            const btnId = this.id;

            if (btnId === 'btn-preview') {
                document.getElementById('module-preview').classList.add('active');
                updateFooter('AI科普视频', '点击视频区域播放AI串讲视频');
            } else if (btnId === 'btn-learn') {
                document.getElementById('module-learn').classList.add('active');
                updateFooter('课中探究', '点击不同标签切换交互模拟模块');
            } else if (btnId === 'btn-quiz') {
                document.getElementById('module-quiz').classList.add('active');
                updateFooter('课后小测', '完成题目后点击提交按钮查看解析');
            }

            // 更新学习进度显示
            updateProgress(btnId);
        });
    });
}

// 知识框架点击跳转
function initKnowledgeFramework() {
    const knowledgeItems = document.querySelectorAll('.knowledge-item');
    knowledgeItems.forEach(item => {
        item.addEventListener('click', function() {
            knowledgeItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const target = this.dataset.target;
            if (target === 'video') {
                // 跳转到AI科普视频
                document.getElementById('btn-preview').click();
            } else {
                // 跳转到课中探究并切换对应标签
                document.getElementById('btn-learn').click();

                if (target === 'solar') {
                    document.getElementById('tab-solar').click();
                } else if (target === 'galaxy') {
                    document.getElementById('tab-galaxy').click();
                } else if (target === 'structure') {
                    document.getElementById('tab-structure').click();
                }
            }
        });
    });
}

// 课中探究标签切换
function initInteractiveTabs() {
    const interactiveTabs = document.querySelectorAll('.interactive-tab');
    interactiveTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            interactiveTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabId = this.id;
            let placeholderContent = '';

            if (tabId === 'tab-solar') {
                placeholderContent = `
                    <img src="https://cdn-icons-png.flaticon.com/512/2534/2534303.png" alt="宇宙中的地球模拟">
                    <h3>宇宙中的地球模拟</h3>
                    <p>点击下方按钮进入交互页面</p>
                    <button class="nav-btn" style="margin-top: 10px;" onclick="openInteractive('solar')">
                        进入模拟 <i class="fas fa-external-link-alt"></i>
                    </button>
                `;
                updateFooter('课中探究', '宇宙中的地球模拟支持拖拽旋转、天体信息查看');
            } else if (tabId === 'tab-galaxy') {
                placeholderContent = `
                    <img src="https://cdn-icons-png.flaticon.com/512/1069/1069696.png" alt="银河系模拟">
                    <h3>银河系模拟（八大行星+太阳活动）</h3>
                    <p>点击下方按钮进入交互页面</p>
                    <button class="nav-btn" style="margin-top: 10px;" onclick="openInteractive('galaxy')">
                        进入模拟 <i class="fas fa-external-link-alt"></i>
                    </button>
                `;
                updateFooter('课中探究', '银河系模拟可演示八大行星轨道、太阳活动对地球的影响');
            } else if (tabId === 'tab-structure') {
                placeholderContent = `
                    <img src="https://cdn-icons-png.flaticon.com/512/4335/4335867.png" alt="地球内部结构交互">
                    <h3>地球内部结构交互</h3>
                    <p>点击下方按钮进入交互页面</p>
                    <button class="nav-btn" style="margin-top: 10px;" onclick="openInteractive('structure')">
                        进入模拟 <i class="fas fa-external-link-alt"></i>
                    </button>
                `;
                updateFooter('课中探究', '地球内部结构交互可模拟地震波传播、圈层划分');
            }

            document.getElementById('interactive-content').innerHTML = `<div class="interactive-placeholder">${placeholderContent}</div>`;
        });
    });
}

// 课后小测标签切换
function initQuizTabs() {
    const quizTabs = document.querySelectorAll('.quiz-tab');
    quizTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            quizTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabId = this.id;
            loadQuizQuestions(tabId);
        });
    });

    // 绑定提交按钮事件
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'submit-quiz') {
            submitQuiz();
        }
    });
}

// 加载测验题目
async function loadQuizQuestions(tabId) {
    let quizType;
    if (tabId === 'tab-basic') quizType = 'basic';
    else if (tabId === 'tab-advanced') quizType = 'advanced';
    else if (tabId === 'tab-expand') quizType = 'expand';
    else return;

    try {
        const response = await fetch(`${API_BASE_URL}/quiz/questions/${quizType}`);
        const data = await response.json();

        if (data.success) {
            renderQuizQuestions(data.questions, quizType);
            updateFooter('课后小测', `当前为${document.getElementById(tabId).textContent}，完成后点击提交查看AI解析`);
        } else {
            console.error('加载题目失败:', data.error);
            renderQuizQuestions([], quizType);
        }
    } catch (error) {
        console.error('加载题目出错:', error);
        renderQuizQuestions([], quizType);
    }
}

// 渲染测验题目
function renderQuizQuestions(questions, quizType) {
    const quizContent = document.getElementById('quiz-content');
    let quizHtml = '';

    if (quizType === 'basic') {
        questions.forEach((q, index) => {
            quizHtml += `
                <div class="quiz-item">
                    <h4>${index + 1}. ${q.question}</h4>
                    <div class="quiz-options">
                        ${q.options.map(opt => `
                            <div class="quiz-option">
                                <input type="radio" name="q${q.id}" value="${opt.id}" data-question-id="${q.id}">
                                ${opt.id}. ${opt.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    } else {
        // 论述题
        questions.forEach((q, index) => {
            quizHtml += `
                <div class="quiz-item">
                    <h4>${index + 1}. ${q.question}</h4>
                    <div class="quiz-options">
                        <textarea style="width: 100%; height: ${quizType === 'expand' ? '150px' : '100px'}; padding: 10px; margin-top: 10px; border: 1px solid #ddd; border-radius: 6px;"
                                  placeholder="请输入你的答案..."
                                  data-question-id="${q.id}"></textarea>
                    </div>
                </div>
            `;
        });
    }

    quizHtml += `
        <button class="quiz-submit" id="submit-quiz">提交答题</button>
        <div class="quiz-result" id="quiz-result" style="display: none;">
            <h3 style="margin-bottom: 10px; color: #27ae60;">答题结果</h3>
            <p id="quiz-score">得分：0分（共100分）</p>
            <p id="quiz-correct">正确题数：0/0</p>
            <p id="quiz-explanation"><strong>错题解析：</strong></p>
        </div>
    `;

    quizContent.innerHTML = quizHtml;
}

// 提交测验
async function submitQuiz() {
    const activeTab = document.querySelector('.quiz-tab.active');
    if (!activeTab) return;

    const tabId = activeTab.id;
    let quizType;
    if (tabId === 'tab-basic') quizType = 'basic';
    else if (tabId === 'tab-advanced') quizType = 'advanced';
    else if (tabId === 'tab-expand') quizType = 'expand';
    else return;

    // 收集答案
    const answers = {};

    if (quizType === 'basic') {
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            const questionId = input.getAttribute('data-question-id');
            answers[questionId] = input.value;
        });
    } else {
        document.querySelectorAll('textarea[data-question-id]').forEach(textarea => {
            const questionId = textarea.getAttribute('data-question-id');
            answers[questionId] = textarea.value.trim();
        });
    }

    if (Object.keys(answers).length === 0) {
        alert('请先回答问题');
        return;
    }

    try {
        const userId = currentUser ? currentUser.id : 1; // 默认用户ID

        const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                answers,
                quizType
            })
        });

        const data = await response.json();

        if (data.success) {
            showQuizResult(data);

            // 更新进度
            if (currentUser) {
                updateUserProgress('quiz', data.score);
            }
        } else {
            alert('提交失败：' + data.error);
        }
    } catch (error) {
        console.error('提交测验出错:', error);
        alert('提交失败，请检查网络连接');
    }
}

// 显示测验结果
function showQuizResult(data) {
    const resultDiv = document.getElementById('quiz-result');
    const scoreSpan = document.getElementById('quiz-score');
    const correctSpan = document.getElementById('quiz-correct');
    const explanationSpan = document.getElementById('quiz-explanation');

    scoreSpan.textContent = `得分：${data.score}分（共100分）`;
    correctSpan.textContent = `正确题数：${data.correctCount}/${data.totalQuestions}`;

    let explanationHtml = '<strong>解析：</strong><br>';
    data.results.forEach((result, index) => {
        explanationHtml += `${index + 1}. ${result.explanation}<br>`;
        if (result.note) {
            explanationHtml += `&nbsp;&nbsp;${result.note}<br>`;
        }
    });

    explanationSpan.innerHTML = explanationHtml;
    resultDiv.style.display = 'block';

    // 滚动到结果
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 播放视频按钮事件 - 外部视频嵌入
function initVideoPlayer() {
    const playBtn = document.getElementById('play-video');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const videoPlayerContainer = document.getElementById('external-video-player');

    if (playBtn && videoPlaceholder && videoPlayerContainer) {
        playBtn.addEventListener('click', function() {
            showLoading();

            // 隐藏占位符，显示视频容器
            videoPlaceholder.style.display = 'none';
            videoPlayerContainer.style.display = 'block';

            // 外部视频URL配置（请替换为你的视频链接）
            const externalVideoURL = "https://www.bilibili.com/video/BV1H7DxBeEwi/?vd_source=83ddb1ab2a6c378a80eaf46581da79b8"; // 示例：YouTube视频
            // 或者 Bilibili: "https://player.bilibili.com/player.html?bvid=YOUR_BVID&page=1"
            // 或者 其他视频平台

            // 创建或更新iframe
            let iframe = document.getElementById('external-video-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'external-video-iframe';
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.style.width = '100%';
                iframe.style.height = '100%';

                // 移除instructions div，添加iframe
                const instructions = videoPlayerContainer.querySelector('.video-instructions');
                if (instructions) {
                    instructions.remove();
                }
                videoPlayerContainer.appendChild(iframe);
            }

            // 设置视频源（避免重复设置）
            if (iframe.src !== externalVideoURL) {
                iframe.src = externalVideoURL;
            }

            // 隐藏加载提示
            setTimeout(() => {
                hideLoading();

                // 更新学习进度（假设用户开始观看）
                if (currentUser) {
                    updateUserProgress('video', 100);
                } else {
                    // 游客模式更新本地显示
                    document.querySelectorAll('.progress-fill')[0].style.width = '100%';
                    document.querySelectorAll('.progress-label')[0].querySelector('span:last-child').textContent = '100%';
                    updateOverallProgress();
                }

                // 提示用户
                alert('外部视频已加载！如果视频没有自动播放，请点击视频区域内的播放按钮。');
            }, 1000);
        });
    }
}

// 打开交互页面
function openInteractive(type) {
    showLoading();
    setTimeout(() => {
        hideLoading();
        let url = '';
        if (type === 'solar') {
            url = 'https://xingxue11.github.io/threejs-cosmos-3d/'; // 替换为实际地址
        } else if (type === 'galaxy') {
            url = 'https://xingxue11.github.io/threejs-cosmos-3d/'; // 替换为实际地址
        } else if (type === 'structure') {
            url = 'https://xingxue11.github.io/threejs-cosmos-3d/'; // 替换为实际地址
        }

        // 在新窗口打开交互页面，也可以改为内嵌iframe
        window.open(url, '_blank');

        // 更新进度
        if (currentUser) {
            if (type === 'solar') {
                updateUserProgress('solar', 100);
            } else if (type === 'galaxy') {
                updateUserProgress('galaxy', 100);
            } else if (type === 'structure') {
                updateUserProgress('structure', 100);
            }
        } else {
            // 游客模式更新本地显示
            if (type === 'solar') {
                document.querySelectorAll('.progress-fill')[1].style.width = '100%';
                document.querySelectorAll('.progress-label')[1].querySelector('span:last-child').textContent = '100%';
            } else if (type === 'galaxy') {
                document.querySelectorAll('.progress-fill')[2].style.width = '100%';
                document.querySelectorAll('.progress-label')[2].querySelector('span:last-child').textContent = '100%';
            } else if (type === 'structure') {
                document.querySelectorAll('.progress-fill')[3].style.width = '100%';
                document.querySelectorAll('.progress-label')[3].querySelector('span:last-child').textContent = '100%';
            }
            updateOverallProgress();
        }
    }, 1000);
}

// AI答疑功能
function initAIChat() {
    const sendBtn = document.getElementById('send-question');
    const inputField = document.getElementById('ai-question');

    if (sendBtn && inputField) {
        sendBtn.addEventListener('click', sendAIQuestion);
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendAIQuestion();
        });
    }
}

async function sendAIQuestion() {
    const question = document.getElementById('ai-question').value.trim();
    if (!question) return;

    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML += `<div class="chat-message chat-user">${question}</div>`;
    document.getElementById('ai-question').value = '';

    chatContainer.innerHTML += `<div class="chat-message chat-ai">🔄 思考中...</div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const answer = await queryDeepseek(question);
        const lastMessage = chatContainer.lastElementChild;
        lastMessage.innerHTML = answer;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
        const lastMessage = chatContainer.lastElementChild;
        lastMessage.innerHTML = "请求失败，请稍后重试~";
        console.error(err);
    }
}

async function queryDeepseek(question) {
    const apiKey = "sk-d4a8e39ae36e48de8179d28389d21aa9"; // 👈 填你自己的
    const apiUrl = "https://api.deepseek.com/v1/chat/completions";

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "你是专业中学地理老师，回答简洁准确，只讲《宇宙中的地球》内容。"
                    },
                    { role: "user", content: question }
                ],
                temperature: 0.3,
                max_tokens: 800
            })
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { data = { contents: text }; }

        const realBody = data.contents ? JSON.parse(data.contents) : data;
        return realBody.choices?.[0]?.message?.content || "无返回内容";

    } catch (err) {
        console.error(err);
        return "API 请求失败（跨域/密钥/网络）";
    }
}

// 登录模块功能
function initLoginModule() {
    const loginModal = document.getElementById('login-modal');
    const loginButton = document.getElementById('login-button');
    const closeLogin = document.getElementById('close-login');
    const modalTitle = document.getElementById('modal-title');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const userName = document.getElementById('user-name');

    // 打开登录模态框
    loginButton.addEventListener('click', function() {
        if (loginButton.textContent === '登录') {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else if (loginButton.textContent === '退出') {
            logout();
        }
    });

    // 关闭登录模态框
    closeLogin.addEventListener('click', function() {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // 点击模态框外部关闭
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 认证标签切换
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // 更新标签状态
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 更新表单显示
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.getAttribute('data-form') === tabName) {
                    form.classList.add('active');
                }
            });

            // 更新模态框标题
            if (tabName === 'login') {
                modalTitle.textContent = '用户登录';
            } else if (tabName === 'register') {
                modalTitle.textContent = '用户注册';
            } else if (tabName === 'forgot') {
                modalTitle.textContent = '忘记密码';
            }
        });
    });

    // 处理登录表单提交
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            hideLoading();

            if (data.success) {
                // 登录成功
                loginModal.classList.remove('active');
                document.body.style.overflow = '';

                // 更新用户信息
                currentUser = data.user;
                userName.textContent = data.user.username;
                loginButton.textContent = '退出';

                // 存储用户信息到本地存储
                localStorage.setItem('user', JSON.stringify(data.user));

                // 更新进度条显示
                if (data.user.progress) {
                    updateProgressBars(data.user.progress);
                }

                // 显示登录成功提示
                alert('登录成功！欢迎回来，' + data.user.username + '！');
            } else {
                // 登录失败
                alert('登录失败：' + data.error);
            }
        } catch (error) {
            hideLoading();
            alert('登录过程中发生错误，请稍后重试');
            console.error('登录错误:', error);
        }
    });

    // 处理注册表单提交
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();

        if (!username) {
            alert('请输入用户名');
            return;
        }

        if (password && password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            hideLoading();

            if (data.success) {
                // 注册成功
                const defaultPassword = password ? '' : '，默认密码：123456';
                alert('注册成功！请登录' + defaultPassword);

                // 切换到登录标签
                document.querySelector('.auth-tab[data-tab="login"]').click();
                // 填充用户名
                document.getElementById('login-username').value = username;
            } else {
                // 注册失败
                alert('注册失败：' + data.error);
            }
        } catch (error) {
            hideLoading();
            alert('注册过程中发生错误，请稍后重试');
            console.error('注册错误:', error);
        }
    });

    // 处理忘记密码表单提交
    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('forgot-username').value.trim();

        if (!username) {
            alert('请输入用户名');
            return;
        }

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();
            hideLoading();

            if (data.success) {
                // 显示密码
                alert('您的密码是：' + data.password);

                // 切换到登录标签
                document.querySelector('.auth-tab[data-tab="login"]').click();
                // 填充用户名
                document.getElementById('login-username').value = username;
            } else {
                // 用户不存在
                alert('该用户不存在');
            }
        } catch (error) {
            hideLoading();
            alert('查询过程中发生错误，请稍后重试');
            console.error('忘记密码错误:', error);
        }
    });
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        currentUser = null;
        document.getElementById('user-name').textContent = '游客';
        document.getElementById('login-button').textContent = '登录';
        localStorage.removeItem('user');
        alert('已退出登录');

        // 重置进度条为默认值
        resetProgressBars();
    }
}

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            currentUser = userData;
            document.getElementById('user-name').textContent = userData.username;
            document.getElementById('login-button').textContent = '退出';

            // 如果有进度信息，更新进度条显示
            if (userData.progress) {
                updateProgressBars(userData.progress);
            }
        } catch (error) {
            console.error('解析用户信息失败:', error);
            localStorage.removeItem('user');
        }
    }
}

// 更新用户进度
async function updateUserProgress(module, value) {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/progress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                progress: { [module]: value }
            })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            updateProgressBars(data.user.progress);
        }
    } catch (error) {
        console.error('更新进度失败:', error);
    }
}

// 更新进度条显示
function updateProgressBars(progress) {
    const progressItems = document.querySelectorAll('.progress-item');

    // AI科普视频进度 (索引0)
    if (progress.video !== undefined) {
        progressItems[0].querySelector('.progress-fill').style.width = progress.video + '%';
        progressItems[0].querySelector('.progress-label span:last-child').textContent = progress.video + '%';
    }

    // 宇宙中的地球模拟进度 (索引1)
    if (progress.solar !== undefined) {
        progressItems[1].querySelector('.progress-fill').style.width = progress.solar + '%';
        progressItems[1].querySelector('.progress-label span:last-child').textContent = progress.solar + '%';
    }

    // 银河系模拟进度 (索引2)
    if (progress.galaxy !== undefined) {
        progressItems[2].querySelector('.progress-fill').style.width = progress.galaxy + '%';
        progressItems[2].querySelector('.progress-label span:last-child').textContent = progress.galaxy + '%';
    }

    // 地球内部结构交互进度 (索引3)
    if (progress.structure !== undefined) {
        progressItems[3].querySelector('.progress-fill').style.width = progress.structure + '%';
        progressItems[3].querySelector('.progress-label span:last-child').textContent = progress.structure + '%';
    }

    // 课后小测进度 (索引4)
    if (progress.quiz !== undefined) {
        progressItems[4].querySelector('.progress-fill').style.width = progress.quiz + '%';
        progressItems[4].querySelector('.progress-label span:last-child').textContent = progress.quiz + '%';
    }

    // 整体进度 (索引5)
    if (progress.overall !== undefined) {
        progressItems[5].querySelector('.progress-fill').style.width = progress.overall + '%';
        progressItems[5].querySelector('.progress-label span:last-child').textContent = progress.overall + '%';
    }
}

// 重置进度条为默认值
function resetProgressBars() {
    const defaultProgress = {
        video: 50,
        solar: 0,
        galaxy: 0,
        structure: 0,
        quiz: 0,
        overall: 8
    };
    updateProgressBars(defaultProgress);
}

// 更新整体进度（游客模式）
function updateOverallProgress() {
    const progressItems = document.querySelectorAll('.progress-fill');
    let total = 0;
    for (let i = 0; i < 5; i++) {
        total += parseInt(progressItems[i].style.width) || 0;
    }
    const overall = Math.round(total / 5);
    progressItems[5].style.width = `${overall}%`;
    document.querySelectorAll('.progress-label')[5].querySelector('span:last-child').textContent = `${overall}%`;
}

// 更新学习进度（导航切换时）
function updateProgress(btnId) {
    const progressItems = document.querySelectorAll('.progress-item');
    if (btnId === 'btn-preview') {
        progressItems[0].querySelector('.progress-fill').style.width = '50%';
        progressItems[0].querySelector('.progress-label span:last-child').textContent = '50%';
    } else if (btnId === 'btn-learn') {
        progressItems[1].querySelector('.progress-fill').style.width = '10%';
        progressItems[1].querySelector('.progress-label span:last-child').textContent = '10%';
    } else if (btnId === 'btn-quiz') {
        progressItems[4].querySelector('.progress-fill').style.width = '10%';
        progressItems[4].querySelector('.progress-label span:last-child').textContent = '10%';
    }
    updateOverallProgress();
}

// 显示/隐藏加载中
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// 更新底部状态栏
function updateFooter(module, tip) {
    const footer = document.querySelector('.footer p');
    if (footer) {
        footer.textContent = `当前模块：${module} | 操作提示：${tip} | AI答疑服务已就绪`;
    }
}