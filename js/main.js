document.addEventListener('DOMContentLoaded', function () {
    // Load header và footer
    const loadHeader = fetch("components/header/header.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;

            const script = document.createElement("script");
            script.src = "components/header/header.js";

            // Đợi script load xong mới tiếp tục
            return new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        })
        .catch(err => console.error("Header load failed:", err));

    const loadFooter = fetch("components/footer/footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        });

    // Sau khi cả header và footer đã load xong, mới load main content
    Promise.all([loadHeader, loadFooter]).then(() => {
        fetch('data/product.json')
            .then(response => response.json())
            .then(products => {
                const recommendSection = document.getElementById("recommendation-section");

                // Chọn 2 nhóm, mỗi nhóm 2 sản phẩm
                const group1 = products.slice(0, 3);
                const group2 = products.slice(3, 6);

                recommendSection.innerHTML = `
                    <div class="custom-product-group">
                        <h2>Recommended Products</h2>
                        <div class="custom-product-block">
                            <div class="custom-product-name">
                                <h3>Books</h3>
                            </div>    
                            <div class="custom-product-list">
                                ${group1.map(product => `
                                    <div class="custom-product-item">
                                        <a href="product.html?id=${product.id}">
                                            <img src="${product.image}" alt="${product.name}">
                                            <p class="custom-price">$${product.price}</p>
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="custom-product-block">
                            <div class="custom-product-name">
                                <h3>Electronics</h3>
                            </div> 
                            <div class="custom-product-list">
                                ${group2.map(product => `
                                    <div class="custom-product-item">
                                        <a href="product.html?id=${product.id}">
                                            <img src="${product.image}" alt="${product.name}">
                                            <p class="custom-price">$${product.price}</p>
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            })
        fetch('data/forum.json')
            .then(res => res.json())
            .then(forums => {
                // Lấy 3 comment có nhiều like nhất
                const topComments = forums
                    .filter(f => f.content && typeof f.likes === 'number')
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 3);

                const commentSection = document.getElementById('comment-section');
                if (!commentSection) return;

                // Tạo nút Go to Forum ở trên
                const forumBtn = document.createElement('a');
                forumBtn.className = 'forum-link-btn';
                forumBtn.href = 'forum.html';
                forumBtn.textContent = 'The Forum';
                commentSection.appendChild(forumBtn);

                // Tạo khung chứa 2 comment nổi bật
                const featuredListDiv = document.createElement('div');
                featuredListDiv.className = 'featured-comment-list';
                commentSection.appendChild(featuredListDiv);

                let currentIdx = 0;
                function showComments(idx) {
                    featuredListDiv.innerHTML = '';
                    for (let i = 0; i < 3; i++) {
                        const c = topComments[(idx + i) % topComments.length];
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'featured-comment';
                        commentDiv.innerHTML = `
                            <div class="featured-comment-block">
                                <div class="featured-comment-content">
                                    <span class="featured-comment-icon">💬</span>
                                    <span>${c.content}</span>
                                </div>
                                <div class="featured-comment-meta">
                                    <img src="${c.user?.avatar || 'user-pic/default.jpg'}" class="featured-comment-avatar" alt="avatar">
                                    <span class="featured-comment-likes">❤️ ${c.likes}</span>
                                    <span class="featured-comment-time">${c.time || ''}</span>
                                </div>
                            </div>
                        `;
                        // Khi click vào comment, chuyển đến forum.html và scroll đến comment đó (theo id)
                        commentDiv.onclick = () => {
                            window.location.href = `forum.html#comment-${c.id}`;
                        };
                        featuredListDiv.appendChild(commentDiv);
                    }
                }

                showComments(currentIdx);

                setInterval(() => {
                    currentIdx = (currentIdx + 1) % topComments.length;
                    showComments(currentIdx);
                }, 4000);
            });
        if (document.getElementById('product-grid') && document.getElementById('bid-grid')) {
            Promise.all([
                fetch('data/product.json').then(res => res.json()),
                fetch('data/bidding.json').then(res => res.json())
            ])
            .then(([normalProducts, bidProducts]) => {
                const productGrid = document.getElementById('product-grid');
                const bidGrid = document.getElementById('bid-grid');

                bidGrid.innerHTML = bidProducts.map(p => `
                    <div class="product-card bidding">
                        <a href="bidding.html?id=${p.id}" onclick="location.href='bidding.html?id=${p.id}'">
                            <img src="${p.image}" alt="${p.name}">
                        </a>
                        <p><strong>${p.name}</strong></p>
                        <p class="price">$${p.currentBid}</p>
                        <div class="seller-info">
                            <img src="${p.seller.avatar}" alt="${p.seller.name}" class="seller-avatar">
                            <span class="seller-name">${p.seller.name}</span>
                        </div>
                    </div>
                `).join('');

                productGrid.innerHTML = normalProducts.map(p => `
                    <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
                        <a href="product.html?id=${p.id}">
                            <img src="${p.image}" alt="${p.name}">
                        </a>
                        <p><strong>${p.name}</strong></p>
                        <p class="price">$${p.price || 'Contact for price'}</p>
                        <div class="seller-info">
                            <img src="${p.seller.avatar}" alt="${p.seller.name}" class="seller-avatar">
                            <span class="seller-name">${p.seller.name}</span>
                        </div>
                    </div>
                `).join('');
            })
            .catch(err => {
                console.error('Error loading products:', err);
            });
        }
    });

});
