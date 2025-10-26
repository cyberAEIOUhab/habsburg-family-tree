// 哈布斯堡家族家谱图 - 专业历史研究版本
// 包含所有有记载的成员和完整的婚配关系

// 导入完整的哈布斯堡家族数据
const habsburgFamilyData = habsburgCompleteData;

// 初始化家谱图
let treeData = habsburgFamilyData;
let showDetails = false;
let showSpouses = true;

// 创建家谱图 - 使用新的生物课本风格布局
function createFamilyTree() {
    try {
        console.log('开始创建家谱图...');

        // 检查D3库是否加载
        if (typeof d3 === 'undefined') {
            console.error('D3库未加载');
            alert('D3库加载失败，请刷新页面');
            return;
        }

        // 检查数据是否加载
        if (typeof habsburgFamilyData === 'undefined') {
            console.error('家谱数据未加载');
            alert('数据文件加载失败');
            return;
        }

        // 检查FamilyTree类是否存在
        if (typeof FamilyTree === 'undefined') {
            console.error('FamilyTree类未定义');
            alert('家谱图类加载失败');
            return;
        }

        // 清空容器并重新初始化家谱图
        const container = d3.select("#family-tree-canvas");
        container.html("");

        console.log('数据:', habsburgFamilyData);
        console.log('容器:', container.node());

        // 使用新的FamilyTree类创建生物课本风格的家谱图
        familyTree = new FamilyTree("#family-tree-canvas", habsburgFamilyData);

        // 添加缩放支持
        d3.select("#family-tree-canvas svg")
            .call(d3.zoom().on("zoom", (event) => {
                d3.select("#family-tree-canvas svg g")
                    .attr("transform", event.transform);
            }));

        console.log('家谱图创建成功');
    } catch (error) {
        console.error('创建家谱图时出错:', error);
        alert('家谱图创建失败: ' + error.message);
    }
}

// 显示节点详情
function showNodeDetails(nodeData) {
    // 构建详细信息
    let details = `
        <h3 style="color: #f5e6d3; margin-bottom: 1.5rem; border-bottom: 2px solid #c19a6b; padding-bottom: 0.8rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">${nodeData.name}</h3>
    `;

    // 基本信息
    if (nodeData.birth && nodeData.death) {
        details += `<p style="color: #d4b896; margin-bottom: 0.8rem;"><strong style="color: #f5e6d3;">生卒:</strong> ${nodeData.birth} - ${nodeData.death}</p>`;
    }

    if (nodeData.reign) {
        details += `<p style="color: #d4b896; margin-bottom: 0.8rem;"><strong style="color: #f5e6d3;">统治时期:</strong> ${nodeData.reign}</p>`;
    }

    if (nodeData.title) {
        details += `<p style="color: #d4b896; margin-bottom: 1.5rem;"><strong style="color: #f5e6d3;">头衔:</strong> ${nodeData.title}</p>`;
    }

    // 配偶信息
    if (nodeData.spouse && nodeData.spouse.length > 0) {
        details += `<div style="margin-top: 1.5rem;">
            <p style="color: #f5e6d3; margin-bottom: 0.8rem; font-weight: 600;">配偶:</p>
            <ul style="margin-left: 1.5rem; color: #d4b896;">`;

        nodeData.spouse.forEach(spouse => {
            details += `<li style="margin-bottom: 0.5rem;">${spouse.name}`;
            if (spouse.marriage) {
                details += ` (结婚: ${spouse.marriage}`;
                if (spouse.children > 0) {
                    details += `, 子女: ${spouse.children}`;
                }
                details += `)`;
            }
            details += `</li>`;
        });

        details += `</ul></div>`;
    }

    // 子女信息
    if (nodeData.children && nodeData.children.length > 0) {
        details += `<p style="color: #d4b896; margin-top: 1.5rem;"><strong style="color: #f5e6d3;">子女数量:</strong> ${nodeData.children.length}</p>`;
    }

    // 详细描述
    if (nodeData.description) {
        details += `<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(193, 154, 107, 0.3);">
            <h4 style="color: #f5e6d3; margin-bottom: 1rem; font-weight: 600;">历史评价</h4>
            <p style="line-height: 1.7; color: #d4b896;">${nodeData.description}</p>
        </div>`;
    }

    // 创建模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background:
            linear-gradient(135deg, rgba(40, 32, 28, 0.95) 0%, rgba(30, 24, 20, 0.98) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><pattern id="modalPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse"><rect fill="%231e1814" width="120" height="120"/><path d="M0,0 L120,120 M120,0 L0,120" stroke="%23302822" stroke-width="1" opacity="0.15"/></pattern></defs><rect width="100%" height="100%" fill="url(%23modalPattern)"/></svg>');
        color: #f5e6d3;
        padding: 2.5rem;
        border-radius: 15px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        position: relative;
        animation: slideUp 0.3s ease;
        border: 2px solid rgba(193, 154, 107, 0.4);
    `;

    modalContent.innerHTML = details + `
        <button onclick="this.parentElement.parentElement.remove()"
                style="position: absolute; top: 1rem; right: 1rem; background: #8b4513; color: #f5e6d3; border: 1px solid #c19a6b; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
            ×
        </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击模态框背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // 添加关闭按钮悬停效果
    const closeBtn = modalContent.querySelector('button');
    closeBtn.addEventListener('mouseover', function() {
        this.style.background = '#a0522d';
        this.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseout', function() {
        this.style.background = '#8b4513';
        this.style.transform = 'scale(1)';
    });
}

// 平滑滚动到指定区域
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// 滚动动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// 导航点击事件
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // 更新活跃状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 滚动到对应区域
            scrollToSection(targetId);
        });
    });
}

// 控制按钮事件
function initControls() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetBtn = document.getElementById('reset-view');
    const toggleDetailsBtn = document.getElementById('toggle-details');
    const toggleSpousesBtn = document.getElementById('toggle-spouses');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (familyTree) {
                familyTree.zoomIn();
            }
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (familyTree) {
                familyTree.zoomOut();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (familyTree) {
                familyTree.resetView();
            }
        });
    }

    if (toggleDetailsBtn) {
        toggleDetailsBtn.addEventListener('click', () => {
            showDetails = !showDetails;
            toggleDetailsBtn.textContent = showDetails ? '隐藏详情' : '显示详情';
            createFamilyTree();
        });
    }

    if (toggleSpousesBtn) {
        toggleSpousesBtn.addEventListener('click', () => {
            showSpouses = !showSpouses;
            toggleSpousesBtn.textContent = showSpouses ? '隐藏配偶' : '显示配偶';
            createFamilyTree();
        });
    }
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) return;

    // 在数据中搜索
    const results = [];
    function searchNode(node) {
        if (node.name.toLowerCase().includes(searchTerm) ||
            (node.title && node.title.toLowerCase().includes(searchTerm)) ||
            (node.reign && node.reign.toLowerCase().includes(searchTerm))) {
            results.push(node);
        }
        if (node.children) {
            node.children.forEach(child => searchNode(child));
        }
    }

    searchNode(habsburgFamilyData);

    if (results.length > 0) {
        // 显示第一个结果
        showNodeDetails(results[0]);

        // 可以添加显示所有结果的列表
        if (results.length > 1) {
            setTimeout(() => {
                alert(`找到 ${results.length} 个匹配结果，已显示第一个。`);
            }, 100);
        }
    } else {
        alert('未找到匹配的成员。');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');

    // 延迟初始化，确保所有资源加载完成
    setTimeout(() => {
        try {
            // 检查关键依赖
            if (typeof d3 === 'undefined') {
                console.error('D3库未加载');
                document.getElementById('family-tree-canvas').innerHTML = '<div style="color: red; padding: 20px; text-align: center;">D3库加载失败，请刷新页面</div>';
                return;
            }

            if (typeof habsburgCompleteData === 'undefined') {
                console.error('数据文件未加载');
                document.getElementById('family-tree-canvas').innerHTML = '<div style="color: red; padding: 20px; text-align: center;">数据文件加载失败</div>';
                return;
            }

            if (typeof FamilyTree === 'undefined') {
                console.error('FamilyTree类未定义');
                document.getElementById('family-tree-canvas').innerHTML = '<div style="color: red; padding: 20px; text-align: center;">家谱图类加载失败</div>';
                return;
            }

            console.log('所有依赖检查通过，开始初始化组件...');

            // 初始化家谱图
            createFamilyTree();

            // 初始化导航
            initNavigation();

            // 初始化控制按钮
            initControls();

            // 初始化搜索功能
            initSearch();

            // 初始化滚动动画
            initScrollAnimations();

            // 窗口大小变化时重新绘制家谱图
            window.addEventListener('resize', () => {
                if (familyTree) {
                    familyTree.init();
                }
            });

            console.log('所有组件初始化完成');
        } catch (error) {
            console.error('初始化过程中出错:', error);
            document.getElementById('family-tree-canvas').innerHTML = '<div style="color: red; padding: 20px; text-align: center;">初始化失败: ' + error.message + '</div>';
        }
    }, 100);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case '+':
            document.getElementById('zoom-in').click();
            break;
        case '-':
            document.getElementById('zoom-out').click();
            break;
        case '0':
            document.getElementById('reset-view').click();
            break;
        case 'd':
            document.getElementById('toggle-details').click();
            break;
        case 's':
            document.getElementById('toggle-spouses').click();
            break;
        case '/':
            e.preventDefault();
            document.getElementById('search-input').focus();
            break;
    }
});