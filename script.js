// 采购数据存储
let purchases = [];
let editingIndex = -1;

// 分页相关
let currentPage = 1;
const itemsPerPage = 10;
let filteredPurchases = []; // 用于存储过滤后的数据（搜索时使用）

// Firebase配置
const firebaseConfig = {
    // 这里需要用户配置自己的Firebase项目信息
    apiKey: "AIzaSyDaVI4B_vXCg9uf9fZL-oSUudj8xvhaws4",
    authDomain: " caigouweb.firebaseapp.com ",
    databaseURL: " https://caigouweb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "caigouweb",
    storageBucket: "caigouweb.firebasestorage.app",
    messagingSenderId: "884397514172",
    appId: "1:884397514172:web:2edde3249c352a3afd1fb9"
};

// 初始化Firebase
let database = null;
let isFirebaseConfigured = false;

// 检查Firebase配置
function initFirebase() {
    try {
        if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
            // 清理配置中的空格
            const cleanedConfig = {
                apiKey: firebaseConfig.apiKey.trim(),
                authDomain: firebaseConfig.authDomain ? firebaseConfig.authDomain.trim() : '',
                databaseURL: firebaseConfig.databaseURL ? firebaseConfig.databaseURL.trim() : '',
                projectId: firebaseConfig.projectId ? firebaseConfig.projectId.trim() : '',
                storageBucket: firebaseConfig.storageBucket ? firebaseConfig.storageBucket.trim() : '',
                messagingSenderId: firebaseConfig.messagingSenderId ? firebaseConfig.messagingSenderId.trim() : '',
                appId: firebaseConfig.appId ? firebaseConfig.appId.trim() : ''
            };
            
            // 验证 databaseURL 格式
            if (cleanedConfig.databaseURL && !cleanedConfig.databaseURL.startsWith('https://')) {
                console.error('Firebase databaseURL 格式不正确，应该以 https:// 开头');
                updateSyncStatus(false);
                return false;
            }
            
            firebase.initializeApp(cleanedConfig);
            database = firebase.database();
            isFirebaseConfigured = true;
            console.log('Firebase已初始化');
            updateSyncStatus(true);
            return true;
        } else {
            console.log('Firebase未配置，使用本地存储');
            updateSyncStatus(false);
            return false;
        }
    } catch (error) {
        console.error('Firebase初始化失败:', error);
        updateSyncStatus(false);
        // 初始化失败时，自动回退到本地存储
        alert('Firebase连接失败，已切换到本地存储模式。请检查Firebase配置是否正确。');
        return false;
    }
}

// 更新同步状态显示
function updateSyncStatus(isConnected) {
    if (!syncStatus) return;
    if (isConnected) {
        syncStatus.style.display = 'flex';
        syncStatusText.textContent = '云端同步';
        syncStatus.className = 'sync-status sync-active';
    } else {
        syncStatus.style.display = 'flex';
        syncStatusText.textContent = '本地存储';
        syncStatus.className = 'sync-status sync-local';
    }
}

// DOM元素
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('purchaseForm');
const tableBody = document.getElementById('tableBody');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const searchResults = document.getElementById('searchResults');
const searchResultsContent = document.getElementById('searchResultsContent');
const purchaseItemsContainer = document.getElementById('purchaseItemsContainer');
const addPurchaseItemBtn = document.getElementById('addPurchaseItemBtn');
const pagination = document.getElementById('pagination');
const pageInfo = document.getElementById('pageInfo');
const pageNumbers = document.getElementById('pageNumbers');
const firstPageBtn = document.getElementById('firstPageBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const lastPageBtn = document.getElementById('lastPageBtn');
const syncStatus = document.getElementById('syncStatus');
const syncStatusText = document.getElementById('syncStatusText');
const modalContent = document.querySelector('.modal-content');
const modalHeader = document.querySelector('.modal-header');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
// 登录相关DOM元素将在initLogin中获取，确保DOM已加载
let loginOverlay = null;
let loginForm = null;
let loginUsernameInput = null;
let loginPasswordInput = null;
let loginError = null;
let loginSuccess = null;

// 拖动相关变量
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initLogin();
});

// 登录初始化
function initLogin() {
    // 获取登录相关DOM元素
    loginOverlay = document.getElementById('loginOverlay');
    loginForm = document.getElementById('loginForm');
    loginUsernameInput = document.getElementById('loginUsername');
    loginPasswordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('loginError');
    loginSuccess = document.getElementById('loginSuccess');
    
    // 检查元素是否存在
    if (!loginOverlay || !loginForm || !loginUsernameInput || !loginPasswordInput || !loginError) {
        console.error('登录相关DOM元素未找到');
        return;
    }
    
    // 已登录则直接进入
    if (localStorage.getItem('loggedIn') === 'true') {
        // 确保登录弹框隐藏
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
            loginOverlay.classList.add('hidden');
        }
        startApp();
        return;
    }
    
    // 监听登录表单
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    // 确保登录弹框显示
    loginOverlay.style.display = 'flex';
    loginOverlay.classList.remove('hidden');
}

// 处理登录
function handleLogin() {
    // 确保DOM元素已获取
    if (!loginUsernameInput || !loginPasswordInput || !loginError || !loginOverlay) {
        console.error('登录相关DOM元素未初始化');
        return;
    }
    
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    
    // 验证输入是否为空
    if (!username || !password) {
        loginError.textContent = '请输入账号和密码';
        loginError.style.display = 'block';
        if (loginSuccess) loginSuccess.style.display = 'none';
        return;
    }
    
    const isValid = username === 'lwj1215' && password === '1215lwj1215';
    
    if (isValid) {
        // 显示成功提示
        if (loginSuccess) {
            loginSuccess.style.display = 'block';
            loginSuccess.textContent = '登录成功！正在进入系统...';
        }
        loginError.style.display = 'none';
        
        // 保存登录状态
        localStorage.setItem('loggedIn', 'true');
        
        // 延迟隐藏弹框，让用户看到成功提示
        setTimeout(() => {
            // 强制隐藏登录弹框
            if (loginOverlay) {
                loginOverlay.style.display = 'none';
                loginOverlay.classList.add('hidden');
            }
            // 启动应用
            startApp();
        }, 800);
    } else {
        // 显示错误提示
        loginError.textContent = '账号或密码错误';
        loginError.style.display = 'block';
        if (loginSuccess) loginSuccess.style.display = 'none';
        // 清空密码框
        loginPasswordInput.value = '';
    }
}

// 启动主程序（仅登录后调用）
function startApp() {
    // 初始化Firebase
    initFirebase();
    
    // 加载数据（如果是Firebase，loadData会设置监听器）
    loadData();
    
    // 如果不是Firebase，需要手动设置filteredPurchases和渲染
    if (!isFirebaseConfigured) {
        filteredPurchases = [...purchases];
        renderTable();
    }
    
    // 事件监听
    addBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', () => closeModal());
    cancelBtn.addEventListener('click', () => closeModal());
    form.addEventListener('submit', handleSubmit);
    searchBtn.addEventListener('click', performSearch);
    clearBtn.addEventListener('click', clearSearch);
    addPurchaseItemBtn.addEventListener('click', addPurchaseItemGroup);
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportFile);
    
    // 分页事件监听
    firstPageBtn.addEventListener('click', () => goToPage(1));
    prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    lastPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
        goToPage(totalPages);
    });
    
    // 搜索框回车键搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 初始化拖动功能
    initDrag();
}

// 初始化拖动功能
function initDrag() {
    if (!modalHeader || !modalContent) return;
    
    modalHeader.addEventListener('mousedown', dragStart);
    
    // 重置位置
    resetModalPosition();
}

// 重置模态框位置
function resetModalPosition() {
    if (modalContent) {
        xOffset = 0;
        yOffset = 0;
        isDragging = false;
        modalContent.style.transform = '';
        modalContent.style.margin = '3% auto';
        modalContent.style.left = '';
        modalContent.style.top = '';
        modalContent.classList.remove('dragging');
    }
}

// 开始拖动
function dragStart(e) {
    // 如果点击的是关闭按钮，不拖动
    if (e.target.classList.contains('close') || e.target.closest('.close')) {
        return;
    }
    
    // 如果点击的不是标题栏，不拖动
    if (e.target !== modalHeader && !modalHeader.contains(e.target)) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    modalContent.classList.add('dragging');
    
    // 获取模态框的当前位置
    const rect = modalContent.getBoundingClientRect();
    const currentLeft = rect.left;
    const currentTop = rect.top;
    
    // 计算鼠标相对于模态框的偏移
    initialX = e.clientX - currentLeft;
    initialY = e.clientY - currentTop;
    
    // 设置定位方式
    modalContent.style.margin = '0';
    modalContent.style.position = 'fixed';
    modalContent.style.left = currentLeft + 'px';
    modalContent.style.top = currentTop + 'px';
    
    // 添加全局事件监听
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
}

// 拖动中
function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 计算新位置
    const newX = e.clientX - initialX;
    const newY = e.clientY - initialY;
    
    // 限制在视口内
    const maxX = window.innerWidth - modalContent.offsetWidth;
    const maxY = window.innerHeight - modalContent.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    // 更新位置
    modalContent.style.left = constrainedX + 'px';
    modalContent.style.top = constrainedY + 'px';
    
    currentX = constrainedX;
    currentY = constrainedY;
}

// 结束拖动
function dragEnd(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = false;
    modalContent.classList.remove('dragging');
    
    // 移除全局事件监听
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
}

// Firebase监听器引用，用于在需要时取消监听
let firebaseListener = null;
let isSavingToFirebase = false; // 标记是否正在保存到Firebase

// 加载数据
function loadData() {
    if (isFirebaseConfigured) {
        // 从Firebase加载数据（使用订单号作为key）
        try {
            const purchasesRef = database.ref('purchases');
            
            // 如果已有监听器，先取消
            if (firebaseListener) {
                purchasesRef.off('value', firebaseListener);
            }
            
            // 设置新的监听器
            firebaseListener = (snapshot) => {
                // 如果正在保存到Firebase，忽略这次更新（避免覆盖本地修改）
                if (isSavingToFirebase) {
                    console.log('正在保存到Firebase，忽略监听器更新');
                    return;
                }
                
                const data = snapshot.val();
                if (data) {
                    // 将对象转换为数组并按订单日期倒序排列（最新的在前）
                    purchases = Object.values(data);
                    purchases.sort((a, b) => {
                        const dateA = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
                        const dateB = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
                        return dateB - dateA; // 倒序：最新日期在前
                    });
                    filteredPurchases = [...purchases];
                    renderTable();
                } else {
                    purchases = [];
                    filteredPurchases = [];
                    renderTable();
                }
            };
            
            purchasesRef.on('value', firebaseListener, (error) => {
                console.error('Firebase加载数据失败:', error);
                console.error('错误详情:', error.message || error);
                updateSyncStatus(false);
                isFirebaseConfigured = false;
                // Firebase加载失败时，尝试从本地存储加载
                alert('Firebase连接失败，已切换到本地存储模式。');
                loadDataFromLocal();
            });
        } catch (error) {
            console.error('Firebase连接错误:', error);
            updateSyncStatus(false);
            isFirebaseConfigured = false;
            alert('Firebase连接错误，已切换到本地存储模式。请检查网络连接和Firebase配置。');
            loadDataFromLocal();
        }
    } else {
        // 从本地存储加载数据
        loadDataFromLocal();
    }
}

// 从本地存储加载数据
function loadDataFromLocal() {
    const saved = localStorage.getItem('purchases');
    if (saved) {
        try {
            purchases = JSON.parse(saved);
            // 按订单日期倒序排列（最新的在前）
            purchases.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
                const dateB = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
                return dateB - dateA; // 倒序：最新日期在前
            });
            filteredPurchases = [...purchases];
            renderTable();
        } catch (error) {
            console.error('解析本地数据失败:', error);
            purchases = [];
            filteredPurchases = [];
            renderTable();
        }
    } else {
        purchases = [];
        filteredPurchases = [];
        renderTable();
    }
}

// 保存数据
function saveData() {
    if (isFirebaseConfigured) {
        // 标记正在保存到Firebase，避免监听器覆盖数据
        isSavingToFirebase = true;
        
        try {
            // 保存到Firebase（使用唯一ID作为key，支持订单号重复）
            const purchasesRef = database.ref('purchases');
            const purchasesObj = {};
            
            // 确保所有记录都有ID
            purchases.forEach((purchase) => {
                // 如果没有ID，生成一个
                const id = purchase.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
                purchase.id = id;
                purchasesObj[id] = purchase;
            });
            
            console.log('准备保存到Firebase，记录数量:', purchases.length);
            console.log('保存的数据:', purchasesObj);
            
            purchasesRef.set(purchasesObj).then(() => {
                console.log('数据已保存到云端，记录数量:', purchases.length);
                // 保存成功后，延迟取消标记，确保数据已同步
                setTimeout(() => {
                    isSavingToFirebase = false;
                }, 500);
            }).catch((error) => {
                console.error('保存数据到Firebase失败:', error);
                console.error('错误详情:', error.message || error);
                isSavingToFirebase = false;
                isFirebaseConfigured = false;
                updateSyncStatus(false);
                alert('Firebase保存失败，已切换到本地存储模式。数据已保存到本地。');
                // Firebase保存失败时，保存到本地存储作为备份
                saveDataToLocal();
            });
        } catch (error) {
            console.error('Firebase连接错误:', error);
            isSavingToFirebase = false;
            isFirebaseConfigured = false;
            updateSyncStatus(false);
            alert('Firebase连接错误，已切换到本地存储模式。数据已保存到本地。');
            // Firebase连接错误时，保存到本地存储
            saveDataToLocal();
        }
    } else {
        // 保存到本地存储
        saveDataToLocal();
    }
}

// 保存数据到本地存储
function saveDataToLocal() {
    try {
        localStorage.setItem('purchases', JSON.stringify(purchases));
        console.log('数据已保存到本地存储');
    } catch (error) {
        console.error('保存到本地存储失败:', error);
        alert('保存数据失败，可能是存储空间不足');
    }
}

// 添加采购项组
function addPurchaseItemGroup(purchaseItem = { supplier: '', items: [] }) {
    const purchaseItemGroup = document.createElement('div');
    purchaseItemGroup.className = 'purchase-item-group';
    
    // 采购商输入
    const header = document.createElement('div');
    header.className = 'purchase-item-header';
    
    const supplierInput = document.createElement('input');
    supplierInput.type = 'text';
    supplierInput.placeholder = '请输入采购商姓名';
    supplierInput.value = purchaseItem.supplier || '';
    supplierInput.required = false; // 采购项改为非必填
    supplierInput.className = 'supplier-input';
    
    const removePurchaseItemBtn = document.createElement('button');
    removePurchaseItemBtn.type = 'button';
    removePurchaseItemBtn.className = 'btn-remove-purchase-item';
    removePurchaseItemBtn.textContent = '删除采购项';
    removePurchaseItemBtn.onclick = () => {
        if (purchaseItemsContainer.children.length > 1) {
            purchaseItemGroup.remove();
            // 更新第一个采购商输入框的required属性（已改为非必填，但保留逻辑）
            if (purchaseItemsContainer.children.length > 0) {
                purchaseItemsContainer.children[0].querySelector('.supplier-input').required = false;
            }
        }
    };
    
    header.appendChild(supplierInput);
    header.appendChild(removePurchaseItemBtn);
    
    // 物品容器
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    
    // 添加物品按钮
    const addItemBtn = document.createElement('button');
    addItemBtn.type = 'button';
    addItemBtn.className = 'btn-add-item';
    addItemBtn.textContent = '+ 添加物品';
    addItemBtn.onclick = () => addItemInput(itemsContainer);
    
    // 如果有预设物品，加载它们
    if (purchaseItem.items && purchaseItem.items.length > 0) {
        purchaseItem.items.forEach(item => addItemInput(itemsContainer, item));
    } else {
        addItemInput(itemsContainer);
    }
    
    purchaseItemGroup.appendChild(header);
    purchaseItemGroup.appendChild(itemsContainer);
    purchaseItemGroup.appendChild(addItemBtn);
    purchaseItemsContainer.appendChild(purchaseItemGroup);
}

// 添加物品输入框
function addItemInput(itemsContainer, value = '') {
    const itemGroup = document.createElement('div');
    itemGroup.className = 'item-input-group';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '请输入物品名称';
    input.value = value;
    input.required = false; // 物品改为非必填
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-item';
    removeBtn.textContent = '删除';
    removeBtn.onclick = () => {
        if (itemsContainer.children.length > 1) {
            itemGroup.remove();
            // 更新第一个输入框的required属性（已改为非必填，但保留逻辑）
            if (itemsContainer.children.length > 0) {
                itemsContainer.children[0].querySelector('input').required = false;
            }
        }
    };
    
    itemGroup.appendChild(input);
    itemGroup.appendChild(removeBtn);
    itemsContainer.appendChild(itemGroup);
}

// 打开模态框
function openModal(index = -1) {
    editingIndex = index;
    
    // 重置模态框位置
    resetModalPosition();
    
    // 清空采购项容器
    purchaseItemsContainer.innerHTML = '';
    
    if (index >= 0 && index < purchases.length) {
        // 编辑模式
        modalTitle.textContent = '编辑采购记录';
        const purchase = purchases[index];
        
        if (!purchase) {
            console.error('找不到要编辑的记录，索引:', index);
            alert('找不到要编辑的记录，请刷新页面后重试');
            return;
        }
        
        document.getElementById('buyerName').value = purchase.buyerName;
        document.getElementById('orderNumber').value = purchase.orderNumber;
        // 设置订单日期，如果没有则使用创建日期或今天
        const orderDate = purchase.orderDate || purchase.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        document.getElementById('orderDate').value = orderDate;
        document.getElementById('paidInFull').checked = purchase.paidInFull || false;
        document.getElementById('shipped').checked = purchase.shipped || false;
        
        // 加载采购项（兼容旧数据格式）
        if (purchase.purchaseItems && purchase.purchaseItems.length > 0) {
            purchase.purchaseItems.forEach(purchaseItem => {
                addPurchaseItemGroup(purchaseItem);
            });
        } else if (purchase.items && purchase.suppliers) {
            // 兼容旧数据：将items和suppliers转换为purchaseItems
            const suppliers = purchase.suppliers.filter(s => s);
            if (suppliers.length > 0) {
                // 如果有多个采购商，尝试分配物品（简单处理：平均分配）
                const itemsPerSupplier = Math.ceil(purchase.items.length / suppliers.length);
                suppliers.forEach((supplier, idx) => {
                    const startIdx = idx * itemsPerSupplier;
                    const endIdx = Math.min(startIdx + itemsPerSupplier, purchase.items.length);
                    const items = purchase.items.slice(startIdx, endIdx);
                    addPurchaseItemGroup({ supplier, items });
                });
            } else {
                // 只有物品，没有采购商（旧数据）
                addPurchaseItemGroup({ supplier: '', items: purchase.items });
            }
        } else {
            addPurchaseItemGroup();
        }
    } else {
        // 添加模式（采购项改为非必填，不自动添加）
        modalTitle.textContent = '添加采购记录';
        form.reset();
        // 设置默认订单日期为今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('orderDate').value = today;
        // 不再自动添加采购项，用户可以选择性添加
    }
    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    modal.style.display = 'none';
    form.reset();
    purchaseItemsContainer.innerHTML = '';
    editingIndex = -1;
}

// 处理表单提交
function handleSubmit(e) {
    e.preventDefault();
    
    const buyerName = document.getElementById('buyerName').value.trim();
    const orderNumber = document.getElementById('orderNumber').value.trim();
    const orderDate = document.getElementById('orderDate').value;
    const paidInFull = document.getElementById('paidInFull').checked;
    const shipped = document.getElementById('shipped').checked;
    
    // 获取所有采购项
    const purchaseItemGroups = purchaseItemsContainer.querySelectorAll('.purchase-item-group');
    const purchaseItems = [];
    const suppliers = [];
    
    purchaseItemGroups.forEach(group => {
        const supplierInput = group.querySelector('.supplier-input');
        const supplier = supplierInput.value.trim();
        
        if (!supplier) {
            return; // 跳过没有采购商的项
        }
        
        const itemInputs = group.querySelectorAll('.items-container input');
        const items = Array.from(itemInputs)
            .map(input => input.value.trim())
            .filter(item => item.length > 0);
        
        if (items.length > 0) {
            purchaseItems.push({ supplier, items });
            if (!suppliers.includes(supplier)) {
                suppliers.push(supplier);
            }
        }
    });
    
    // 验证必填字段（采购项改为非必填）
    if (!buyerName || !orderNumber || !orderDate) {
        alert('请填写客户姓名、订单号和订单日期！');
        return;
    }
    
    // 订单号允许重复，不再进行唯一性验证
    
    // 获取原记录（如果是编辑模式）
    let oldPurchase = null;
    if (editingIndex >= 0 && editingIndex < purchases.length) {
        oldPurchase = purchases[editingIndex];
    }
    
    // 生成唯一ID（用于Firebase存储）
    // 编辑时使用原记录的ID，新增时生成新ID
    const uniqueId = oldPurchase && oldPurchase.id 
        ? oldPurchase.id 
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // 如果编辑时没有采购项，保留原记录的采购项（如果原记录有的话）
    let finalPurchaseItems = purchaseItems;
    let finalSuppliers = suppliers;
    
    // 如果是编辑模式且新的采购项为空，但原记录有采购项，保留原采购项
    if (oldPurchase && purchaseItems.length === 0) {
        if (oldPurchase.purchaseItems && oldPurchase.purchaseItems.length > 0) {
            finalPurchaseItems = oldPurchase.purchaseItems;
            finalSuppliers = oldPurchase.suppliers || [];
        } else if (oldPurchase.items && oldPurchase.items.length > 0) {
            // 兼容旧数据格式
            finalPurchaseItems = oldPurchase.suppliers && oldPurchase.suppliers.length > 0
                ? oldPurchase.suppliers.map((supplier, idx) => ({
                    supplier: supplier,
                    items: oldPurchase.items || []
                }))
                : [{ supplier: '', items: oldPurchase.items }];
            finalSuppliers = oldPurchase.suppliers || [];
        }
    }
    
    const purchaseData = {
        id: uniqueId, // 添加唯一ID用于Firebase存储
        buyerName,
        orderNumber,
        orderDate,
        suppliers: finalSuppliers, // 保留suppliers字段以兼容旧代码
        purchaseItems: finalPurchaseItems,
        paidInFull,
        shipped,
        createdAt: oldPurchase ? oldPurchase.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingIndex >= 0 && editingIndex < purchases.length) {
        // 更新现有记录（oldPurchase 已在上面定义）
        if (!oldPurchase) {
            console.error('编辑索引无效:', editingIndex);
            alert('编辑失败：找不到要编辑的记录，请刷新页面后重试');
            return;
        }
        
        // 保存旧记录的ID，确保更新时使用正确的ID
        const recordId = oldPurchase.id || purchaseData.id;
        purchaseData.id = recordId; // 确保使用原记录的ID
        
        // 在排序前先找到并更新记录（使用ID查找，不依赖索引）
        let recordIndex = -1;
        if (recordId) {
            recordIndex = purchases.findIndex(p => p.id === recordId);
        }
        
        // 如果通过ID找不到，尝试使用订单号和创建时间匹配
        if (recordIndex === -1) {
            recordIndex = purchases.findIndex(p => 
                p.orderNumber === oldPurchase.orderNumber &&
                p.createdAt === oldPurchase.createdAt
            );
        }
        
        // 如果还是找不到，使用原索引（但这种情况不应该发生）
        if (recordIndex === -1) {
            console.warn('通过ID和订单号都找不到记录，使用原索引更新');
            recordIndex = editingIndex;
        }
        
        // 确保索引有效
        if (recordIndex >= 0 && recordIndex < purchases.length) {
            // 找到记录，更新它（使用 Object.assign 确保所有字段都被正确更新）
            Object.assign(purchases[recordIndex], purchaseData);
            console.log('更新记录成功，索引:', recordIndex, 'ID:', recordId, '订单号:', purchaseData.orderNumber);
            console.log('更新后的记录:', purchases[recordIndex]);
        } else {
            console.error('编辑索引无效:', recordIndex, '数组长度:', purchases.length);
            alert('编辑失败：无法找到要更新的记录，请刷新页面后重试');
            return;
        }
        
        // 如果使用Firebase且旧记录有ID，需要从Firebase删除旧记录（使用ID而不是订单号）
        // 注意：这里不需要删除，因为我们会用相同的ID更新，Firebase会自动覆盖
        // 但为了确保数据一致性，我们仍然保存整个数组
    } else {
        // 添加新记录到数组开头（最新的在前）
        purchases.unshift(purchaseData);
    }
    
    // 重新排序（按订单日期倒序，最新的在前）
    purchases.sort((a, b) => {
        const dateA = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA; // 倒序：最新日期在前
    });
    
    // 确保 purchases 数组不为空且包含更新后的记录
    console.log('保存后 purchases 数组长度:', purchases.length);
    console.log('保存后的记录:', purchaseData);
    
    // 验证记录是否在数组中
    const savedRecord = purchases.find(p => p.id === purchaseData.id);
    if (!savedRecord) {
        console.error('保存失败：记录未在数组中找到');
        alert('保存失败：记录未正确保存，请刷新页面后重试');
        return;
    }
    
    // 保存数据
    try {
        saveData();
    } catch (error) {
        console.error('保存数据时出错:', error);
        alert('保存数据时出错，但记录已更新');
    }
    
    // 更新 filteredPurchases
    filteredPurchases = [...purchases];
    console.log('filteredPurchases 更新后长度:', filteredPurchases.length);
    
    // 渲染表格
    try {
        renderTable();
    } catch (error) {
        console.error('渲染表格时出错:', error);
        alert('渲染表格时出错，请刷新页面');
        // 即使出错也要关闭模态框
        closeModal();
        return;
    }
    
    closeModal();
    
    // 显示保存成功提示
    alert('保存成功！');
}

// 编辑记录
function editPurchase(idOrIndex) {
    let purchaseIndex = -1;
    let purchaseToEdit = null;
    
    console.log('编辑记录，传入参数:', idOrIndex, '类型:', typeof idOrIndex);
    
    // 如果传入的是ID（字符串），通过ID查找
    if (typeof idOrIndex === 'string' && idOrIndex && !idOrIndex.match(/^\d+$/)) {
        // 是字符串ID，不是纯数字
        purchaseIndex = purchases.findIndex(p => p.id === idOrIndex);
        if (purchaseIndex >= 0) {
            purchaseToEdit = purchases[purchaseIndex];
            console.log('通过ID找到记录，索引:', purchaseIndex);
        } else {
            // 如果通过ID找不到，尝试通过创建时间和订单号匹配
            console.log('通过ID找不到，尝试其他方式查找');
        }
    }
    
    // 如果还没找到，尝试作为索引处理
    if (purchaseIndex === -1) {
        const actualIndex = typeof idOrIndex === 'number' ? idOrIndex : parseInt(idOrIndex);
        if (!isNaN(actualIndex) && actualIndex >= 0 && actualIndex < filteredPurchases.length) {
            purchaseToEdit = filteredPurchases[actualIndex];
            console.log('通过索引找到记录:', purchaseToEdit);
            
            if (purchaseToEdit) {
                // 使用 ID 或订单号+创建时间在 purchases 数组中查找实际索引
                if (purchaseToEdit.id) {
                    purchaseIndex = purchases.findIndex(p => p.id === purchaseToEdit.id);
                } else {
                    // 兼容旧数据：使用订单号和创建时间匹配
                    purchaseIndex = purchases.findIndex(p => 
                        p.orderNumber === purchaseToEdit.orderNumber &&
                        p.createdAt === purchaseToEdit.createdAt
                    );
                }
            }
        }
    }
    
    if (purchaseIndex === -1 || !purchaseToEdit) {
        console.error('找不到要编辑的记录，ID/索引:', idOrIndex);
        console.error('当前 purchases 数组:', purchases);
        console.error('当前 filteredPurchases 数组:', filteredPurchases);
        alert('找不到要编辑的记录，请刷新页面后重试');
        return;
    }
    
    console.log('准备打开编辑模态框，索引:', purchaseIndex);
    openModal(purchaseIndex);
}

// 删除记录
function deletePurchase(index) {
    if (confirm('确定要删除这条采购记录吗？')) {
        // index是当前页的索引，需要转换为filteredPurchases中的实际索引
        const actualIndex = (currentPage - 1) * itemsPerPage + index;
        const purchaseToDelete = filteredPurchases[actualIndex];
        
        // 在purchases中找到并删除对应的记录（使用ID或索引匹配）
        let purchaseIndex = -1;
        if (purchaseToDelete.id) {
            purchaseIndex = purchases.findIndex(p => p.id === purchaseToDelete.id);
        } else {
            // 兼容旧数据：使用订单号和创建时间匹配，或者直接使用索引
            purchaseIndex = purchases.findIndex(p => 
                p.orderNumber === purchaseToDelete.orderNumber &&
                p.createdAt === purchaseToDelete.createdAt
            );
            // 如果还是找不到，使用实际索引
            if (purchaseIndex === -1) {
                purchaseIndex = actualIndex;
            }
        }
        
        if (purchaseIndex >= 0) {
            purchases.splice(purchaseIndex, 1);
            
            // 重新排序（按订单日期倒序，最新的在前）
            purchases.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
                const dateB = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
                return dateB - dateA; // 倒序：最新日期在前
            });
            
            saveData();
            filteredPurchases = [...purchases];
            
            // 如果当前页没有数据了，回到上一页
            const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            }
            
            renderTable();
        }
    }
}

// 渲染表格
function renderTable() {
    // 确保 tableBody 存在
    if (!tableBody) {
        console.error('tableBody 元素不存在');
        return;
    }
    
    // 如果没有数据，初始化filteredPurchases
    if (filteredPurchases.length === 0 && purchases.length > 0) {
        filteredPurchases = [...purchases];
    }
    
    // 如果没有数据，显示空状态
    if (filteredPurchases.length === 0) {
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <p>暂无采购记录</p>
                        <p style="font-size: 14px; margin-top: 8px;">点击"添加采购记录"按钮开始添加</p>
                    </td>
                </tr>
            `;
        }
        if (pagination) {
            pagination.style.display = 'none';
        }
        return;
    }
    
    // 计算分页
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    
    // 确保当前页在有效范围内
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (currentPage < 1) {
        currentPage = 1;
    }
    
    // 获取当前页的数据
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredPurchases.length);
    const currentPageData = filteredPurchases.slice(startIndex, endIndex);
    
    // 渲染当前页数据
    tableBody.innerHTML = currentPageData.map((purchase, index) => {
        const actualIndex = startIndex + index;
        // 获取所有采购商（兼容旧数据）
        const suppliers = purchase.suppliers || (purchase.purchaseItems ? purchase.purchaseItems.map(pi => pi.supplier) : []);
        const suppliersHtml = [...new Set(suppliers)].map(s => 
            `<span class="supplier-tag">${s}</span>`
        ).join('');
        
        // 显示采购项（采购商-物品对应关系）
        let itemsHtml = '';
        if (purchase.purchaseItems && purchase.purchaseItems.length > 0) {
            itemsHtml = purchase.purchaseItems.map(pi => {
                const itemsTags = pi.items.map(item => 
                    `<span class="item-tag">${item}</span>`
                ).join('');
                return `
                    <div class="purchase-item-display">
                        <div class="supplier-name-display">${pi.supplier}:</div>
                        <div class="item-list">${itemsTags}</div>
                    </div>
                `;
            }).join('');
        } else if (purchase.items) {
            // 兼容旧数据
            const itemsTags = purchase.items.map(item => 
                `<span class="item-tag">${item}</span>`
            ).join('');
            itemsHtml = `<div class="item-list">${itemsTags}</div>`;
        } else {
            itemsHtml = '<span style="color: #6c757d;">暂无</span>';
        }
        
        const paidStatusClass = purchase.paidInFull ? 'status-paid' : 'status-unpaid';
        const paidStatusText = purchase.paidInFull ? '已付清' : '未付清';
        
        const shippedStatusClass = purchase.shipped ? 'status-shipped' : 'status-not-shipped';
        const shippedStatusText = purchase.shipped ? '已发货' : '未发货';
        
        // 格式化订单日期
        const orderDate = purchase.orderDate || purchase.createdAt?.split('T')[0] || '';
        const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('zh-CN') : '未设置';
        
        return `
            <tr>
                <td>${actualIndex + 1}</td>
                <td>${formattedDate}</td>
                <td>${purchase.buyerName}</td>
                <td>${purchase.orderNumber}</td>
                <td>
                    <div class="supplier-list">
                        ${suppliersHtml || '<span style="color: #6c757d;">暂无</span>'}
                    </div>
                </td>
                <td>
                    ${itemsHtml}
                </td>
                <td>
                    <span class="status-badge ${paidStatusClass}">${paidStatusText}</span>
                </td>
                <td>
                    <span class="status-badge ${shippedStatusClass}">${shippedStatusText}</span>
                </td>
                <td>
                    <button class="btn btn-edit" onclick="editPurchase('${purchase.id || (purchase.createdAt ? purchase.createdAt + '_' + purchase.orderNumber : actualIndex.toString())}')">编辑</button>
                    <button class="btn btn-delete" onclick="deletePurchase(${index})">删除</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // 更新分页信息
    updatePagination(totalPages, startIndex + 1, endIndex, filteredPurchases.length);
}

// 更新分页控件
function updatePagination(totalPages, startItem, endItem, totalItems) {
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // 更新分页信息
    pageInfo.textContent = `显示第 ${startItem}-${endItem} 条，共 ${totalItems} 条`;
    
    // 更新按钮状态
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
    
    // 生成页码按钮
    let pageNumbersHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        pageNumbersHtml += `<button class="btn btn-page" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            pageNumbersHtml += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            pageNumbersHtml += `<button class="btn btn-page btn-page-active" onclick="goToPage(${i})">${i}</button>`;
        } else {
            pageNumbersHtml += `<button class="btn btn-page" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbersHtml += `<span class="page-ellipsis">...</span>`;
        }
        pageNumbersHtml += `<button class="btn btn-page" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    pageNumbers.innerHTML = pageNumbersHtml;
}

// 跳转到指定页
function goToPage(page) {
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    if (page < 1 || page > totalPages) {
        return;
    }
    currentPage = page;
    renderTable();
    // 滚动到表格顶部
    document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 执行搜索
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('请输入订单号或客户姓名进行搜索！');
        return;
    }
    
    // 增强模糊搜索：搜索订单号、客户姓名、采购商、物品等
    const results = purchases.filter(purchase => {
        const orderNumber = (purchase.orderNumber || '').toLowerCase();
        const buyerName = (purchase.buyerName || '').toLowerCase();
        
        // 搜索采购商
        const suppliers = purchase.suppliers || (purchase.purchaseItems ? purchase.purchaseItems.map(pi => pi.supplier) : []);
        const suppliersStr = suppliers.join(' ').toLowerCase();
        
        // 搜索物品
        let itemsStr = '';
        if (purchase.purchaseItems && purchase.purchaseItems.length > 0) {
            itemsStr = purchase.purchaseItems.map(pi => pi.items.join(' ')).join(' ').toLowerCase();
        } else if (purchase.items) {
            itemsStr = purchase.items.join(' ').toLowerCase();
        }
        
        return orderNumber.includes(searchTerm) ||
               buyerName.includes(searchTerm) ||
               suppliersStr.includes(searchTerm) ||
               itemsStr.includes(searchTerm);
    });
    
    // 更新过滤后的数据并重置到第一页
    filteredPurchases = results;
    currentPage = 1;
    
    if (results.length === 0) {
        searchResultsContent.innerHTML = `
            <div class="empty-state">
                <p>未找到匹配的订单</p>
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }
    
    // 渲染搜索结果
    searchResultsContent.innerHTML = results.map(purchase => {
        // 获取所有采购商（兼容旧数据）
        const suppliers = purchase.suppliers || (purchase.purchaseItems ? purchase.purchaseItems.map(pi => pi.supplier) : []);
        const suppliersHtml = [...new Set(suppliers)].map(s => 
            `<span class="supplier-tag">${s}</span>`
        ).join('');
        
        // 格式化订单日期
        const orderDate = purchase.orderDate || purchase.createdAt?.split('T')[0] || '';
        const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('zh-CN') : '未设置';
        
        const paidStatusClass = purchase.paidInFull ? 'status-paid' : 'status-unpaid';
        const paidStatusText = purchase.paidInFull ? '已付清' : '未付清';
        
        const shippedStatusClass = purchase.shipped ? 'status-shipped' : 'status-not-shipped';
        const shippedStatusText = purchase.shipped ? '已发货' : '未发货';
        
        // 综合状态：已付清且已发货 = 已完成，否则 = 待处理
        const isComplete = purchase.paidInFull && purchase.shipped;
        const overallStatusClass = isComplete ? 'status-complete' : 'status-pending';
        const overallStatusText = isComplete ? '✓ 已完成' : '⚠ 待处理';
        
        // 显示采购项（采购商-物品对应关系）
        let itemsHtml = '';
        if (purchase.purchaseItems && purchase.purchaseItems.length > 0) {
            itemsHtml = purchase.purchaseItems.map(pi => {
                const itemsTags = pi.items.map(item => 
                    `<span class="item-tag">${item}</span>`
                ).join('');
                return `
                    <div class="purchase-item-display" style="margin-bottom: 8px;">
                        <div class="supplier-name-display">${pi.supplier}:</div>
                        <div class="item-list" style="margin-top: 4px;">${itemsTags}</div>
                    </div>
                `;
            }).join('');
        } else if (purchase.items) {
            // 兼容旧数据
            const itemsTags = purchase.items.map(item => 
                `<span class="item-tag">${item}</span>`
            ).join('');
            itemsHtml = `<div class="item-list">${itemsTags}</div>`;
        } else {
            itemsHtml = '<span style="color: #6c757d;">暂无</span>';
        }
        
        return `
            <div class="search-result-item">
                <h4>订单号：${purchase.orderNumber}</h4>
                <div class="search-result-info">
                    <div><strong>订单日期：</strong>${formattedDate}</div>
                    <div><strong>客户姓名：</strong>${purchase.buyerName}</div>
                    <div><strong>采购商姓名：</strong>${suppliers.length > 0 ? suppliers.join('、') : '暂无'}</div>
                    <div style="grid-column: 1 / -1;"><strong>采购物品：</strong>
                        <div style="margin-top: 8px;">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
                <div class="search-status-group">
                    <span class="status-badge ${paidStatusClass}">尾款：${paidStatusText}</span>
                    <span class="status-badge ${shippedStatusClass}">发货：${shippedStatusText}</span>
                    <span class="status-badge ${overallStatusClass}">${overallStatusText}</span>
                </div>
            </div>
        `;
    }).join('');
    
    searchResults.style.display = 'block';
}

// 清除搜索
function clearSearch() {
    searchInput.value = '';
    searchResults.style.display = 'none';
    searchResultsContent.innerHTML = '';
    filteredPurchases = [...purchases];
    currentPage = 1;
    renderTable();
}

// 导出数据到JSON文件
function exportData() {
    try {
        // 准备导出数据
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            purchases: purchases
        };
        
        // 转换为JSON字符串
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 生成文件名（包含日期时间）
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        a.download = `采购数据_${dateStr}_${timeStr}.json`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('数据导出成功！文件已保存到下载文件夹。');
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败，请重试。');
    }
}

// 处理导入文件
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    // 检查文件类型
    if (!file.name.endsWith('.json')) {
        alert('请选择JSON格式的文件！');
        importFileInput.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const importData = JSON.parse(content);
            
            // 验证数据格式
            if (!importData.purchases || !Array.isArray(importData.purchases)) {
                throw new Error('文件格式不正确，缺少purchases数组');
            }
            
            // 确认导入操作
            const confirmMessage = `准备导入 ${importData.purchases.length} 条采购记录。\n\n` +
                `当前有 ${purchases.length} 条记录。\n\n` +
                `请选择导入方式：\n` +
                `确定：合并数据（保留现有数据，添加新数据）\n` +
                `取消：替换数据（清空现有数据，使用导入数据）`;
            
            if (confirm(confirmMessage)) {
                // 合并模式：添加新数据，避免重复
                importData.purchases.forEach(newPurchase => {
                    // 检查是否已存在（通过ID或订单号+创建时间判断）
                    const exists = purchases.some(existing => {
                        if (newPurchase.id && existing.id) {
                            return existing.id === newPurchase.id;
                        }
                        return existing.orderNumber === newPurchase.orderNumber &&
                               existing.createdAt === newPurchase.createdAt;
                    });
                    
                    if (!exists) {
                        purchases.push(newPurchase);
                    }
                });
                
                alert(`导入成功！已合并 ${importData.purchases.length} 条记录。`);
            } else {
                // 替换模式：清空现有数据，使用导入数据
                if (confirm('确定要替换所有现有数据吗？此操作不可撤销！')) {
                    purchases = importData.purchases;
                    alert(`导入成功！已替换为 ${purchases.length} 条记录。`);
                } else {
                    importFileInput.value = '';
                    return;
                }
            }
            
            // 重新排序
            purchases.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.updatedAt || 0).getTime();
                const dateB = new Date(b.orderDate || b.createdAt || b.updatedAt || 0).getTime();
                return dateB - dateA;
            });
            
            // 保存数据
            saveData();
            
            // 更新显示
            filteredPurchases = [...purchases];
            currentPage = 1;
            renderTable();
            
            // 清空文件输入
            importFileInput.value = '';
            
        } catch (error) {
            console.error('导入数据失败:', error);
            alert('导入数据失败：' + error.message + '\n请检查文件格式是否正确。');
            importFileInput.value = '';
        }
    };
    
    reader.onerror = function() {
        alert('读取文件失败，请重试。');
        importFileInput.value = '';
    };
    
    reader.readAsText(file);
}
