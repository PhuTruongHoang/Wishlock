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

                // Chọn 3 sản phẩm bất kỳ (hoặc chọn sản phẩm theo logic riêng)
                const recommendedItems = products.slice(0, 4);

                recommendSection.innerHTML = `<h2>Không mua cắt cu</h2><div class="recommend-grid"></div>`;

                const grid = recommendSection.querySelector('.recommend-grid');

                recommendedItems.forEach(product => {
                    const item = document.createElement("div");
                    item.className = "recommend-item";
                    item.innerHTML = `
                        <a href="product.html?id=${product.id}">
                            <img src="${product.image}" alt="${product.name}" class="recommend-img">
                            <p class="recommend-price">$${product.price}</p>
                        </a>
                    `;
                    grid.appendChild(item);
                });
            })
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
