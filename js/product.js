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

    Promise.all([loadHeader, loadFooter]).then(() => {
        const container = document.getElementById("product-detail");
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get("id"));

        fetch("data/product.json")
            .then(res => res.json())
            .then(products => {
            const product = products.find(p => p.id === id);

            if (!product) {
                container.innerHTML = `<p style="text-align:center;">Product not found.</p>`;
                return;
            }

            container.innerHTML = `
                <div class="product-detail-container">
                    <div class="item-image">
                        <img src="${product.image}" alt="${product.name}" id="mainImage">
                    </div>

                    <div class="product-info">
                        <h1>${product.name}</h1>
                        <p class="product-price"><strong>${product.price}</strong></p>
                        <button class="buy-btn">Buy Now</button>
                        <p class="product-shipping"><strong>Shipping fee</strong> ${product.shipping_fee}</p>

                        <div class="section-heading"><h3>Item description</h3></div>
                        <div class="product-desc"><p>${product.desc}</p></div>

                        <div class="section-heading"><h3>Item details</h3></div>
                        <div class="product-details">
                            <table>
                                <tr><th>Category</th><td>${product.category}</td></tr>
                                <tr><th>Brand</th><td>${product.brand}</td></tr>
                                <tr><th>Item condition</th><td>${product.condition}</td></tr>
                                <tr><th>Ships from</th><td>${product.ship_from}</td></tr>
                            </table>
                        </div>

                        <div class="section-heading"><h3>Seller</h3></div>
                        <div class="product-seller">
                            <div class="seller-content">
                                <img src="${product.seller.avatar}" alt="${product.seller.name}" class="seller-avatar">
                                <div class="seller-info">
                                    <p><strong>${product.seller.name}</strong></p>
                                    <p>${product.seller.rating}⭐ (${product.seller.reviews} reviews)</p>
                                </div>
                            </div>
                        </div>

                        <div class="section-heading"><h3>Comments</h3></div>
                        <div class="comment-shortcuts">
                            <label for="comment-input" class="comment-label">Comments on the product</label>
                            <textarea id="comment-input" maxlength="100" placeholder="Comment"></textarea>
                            <div class="comment-char-count"><span id="charCount">0</span>/100</div>
                                <p class="comment-note">
                                    Let's think about the other person and make polite comments. Unpleasant language may be restricted or withdrawn from membership.
                                </p>
                            <button class="send-comment-btn">Send a comment</button>
                        </div>

                        <div class="section-heading"><h3>Other users comments</h3></div>
                        <div class="other-users-comments">
                            ${product.comments.map(c => `
                                <div class="comment-block">
                                <div class="comment">
                                    <p><strong>${c.user}</strong> (${c.time}):</p>
                                    <p><strong>Rating: </strong>${c.rating}⭐</p>
                                    <p>${c.text}</p>
                                </div>
                                ${c.reply ? `
                                    <div class="seller-reply">
                                    <p><strong>${product.seller.name}</strong> replied:</p>
                                    <p>${c.reply}</p>
                                    </div>` : ''
                                }
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `;

            // Zoom modal
            const modal = document.getElementById("zoomModal");
            const modalImg = document.getElementById("zoomedImage");
            const closeBtn = document.querySelector(".close");
            const mainImg = document.getElementById("mainImage");

            let zoomLevel = 1;
            let isDragging = false;
            let startX = 0, startY = 0;
            let currentX = 0, currentY = 0;

            mainImg.onclick = () => {
                modal.style.display = "flex";
                modalImg.src = mainImg.src;
                zoomLevel = 1;
                currentX = 0;
                currentY = 0;
                updateTransform();
            };

            document.getElementById("zoomInBtn").onclick = () => {
                zoomLevel += 0.2;
                updateTransform();
            };
            document.getElementById("zoomOutBtn").onclick = () => {
                zoomLevel = Math.max(1, zoomLevel - 0.2); // Giới hạn không nhỏ hơn 1
                if (zoomLevel === 1) {
                    currentX = 0;
                    currentY = 0;
                }
                updateTransform();
            };
            if (zoomLevel === 1) {
                currentX = 0;
                currentY = 0;
            }

            function updateTransform() {
                modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
                modalImg.style.cursor = zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default";
            }

            // Kéo ảnh
            modalImg.addEventListener("mousedown", (e) => {
                if (zoomLevel <= 1) return;
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                modalImg.style.cursor = "grabbing";

                // Ngăn chọn text khi kéo
                e.preventDefault();
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDragging) return;
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                updateTransform();
            });

            document.addEventListener("mouseup", () => {
                if (isDragging) {
                    isDragging = false;
                    modalImg.style.cursor = zoomLevel > 1 ? "grab" : "default";
                }
            });

            closeBtn.onclick = () => {
                modal.style.display = "none";
                isDragging = false;
            };

            // Comment char count
            const textarea = document.getElementById("comment-input");
            const charCount = document.getElementById("charCount");
            if (textarea && charCount) {
                textarea.addEventListener("input", () => {
                    charCount.textContent = textarea.value.length;
                });
            }
        })
        .catch(err => {
        console.error("Failed to load product data:", err);
        container.innerHTML = `<p style="text-align:center;">Error loading product.</p>`;
        });
    })
});

