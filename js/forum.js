document.addEventListener('DOMContentLoaded', function () {
    // Load header và footer
    const loadHeader = fetch("components/header/header.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;

            const script = document.createElement("script");
            script.src = "components/header/header.js";
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
        fetch('data/forum.json')
            .then(response => response.json())
            .then(data => renderAllProducts(data))
            .catch(error => console.error("Error loading JSON:", error));

        function renderAllProducts(products) {
            const feed = document.getElementById("product-feed");
            feed.innerHTML = ""; // Clear old content
            products.forEach(product => {
                const card = document.createElement("div");
                card.className = "card";
                card.id = `comment-${product.id}`;
                // Nếu có ảnh sản phẩm thì hiển thị
                if (product.product && product.product.image) {
                    const imgContainer = document.createElement("div");
                    imgContainer.className = "product-img-container";

                    const img = document.createElement("img");
                    img.src = product.product.image;
                    img.alt = product.product.name || "Product";
                    img.className = "product-img";

                    imgContainer.appendChild(img);
                    card.appendChild(imgContainer);
                }

                const price = document.createElement("div");
                // Tìm giá trong content nếu có
                if (product.product && product.product.price !== undefined) {
                    const price = document.createElement("div");
                    price.className = "price";
                    price.textContent = `$${product.product.price}`;
                    card.appendChild(price);
                }


                const seller = document.createElement("div");
                seller.className = "seller";
                seller.innerHTML = `
                    <img src="${product.user.avatar}" alt="avatar" class="avatar">
                    <div>
                        <div class="seller-name">${product.user.name}</div>
                        <div class="seller-rating">${product.time}</div>
                    </div>
                `;
                card.appendChild(seller);

                const content = document.createElement("div");
                content.className = "forum-content";
                content.textContent = product.content;
                card.appendChild(content);

                // Reply section
                if (product.replies && product.replies.length > 0) {
                    const replyList = document.createElement("div");
                    replyList.className = "reply-list";
                    product.replies.forEach(reply => {
                        const replyDiv = document.createElement("div");
                        replyDiv.className = "reply";
                        replyDiv.innerHTML = `
                            <span class="reply-user">${reply.user}</span>
                            <span class="reply-time">${reply.time}</span>
                            <div>${reply.text}</div>
                        `;
                        replyList.appendChild(replyDiv);
                    });
                    card.appendChild(replyList);
                }                

                //Heart button
                const likeBtn = document.createElement("button");
                likeBtn.className = "like-btn";
                likeBtn.textContent = `❤️ ${product.likes}`;
                let liked = false;
                likeBtn.onclick = () => {
                    if (!liked) {
                        product.likes++;
                        likeBtn.textContent = `❤️ ${product.likes}`;
                        liked = true;
                        likeBtn.textContent = `❤️ ${product.likes}`; 
                        likeBtn.style.background = "#FF69B4"; 
                    } else {
                        product.likes--;
                        likeBtn.textContent = `❤️ ${product.likes}`;
                        liked = false;
                        likeBtn.style.background = "#2C73D2";
                    }
                };
                card.appendChild(likeBtn);                


                // ===== Thêm nút và form comment =====
                const commentToggleBtn = document.createElement("button");
                commentToggleBtn.className = "like-btn";
                commentToggleBtn.textContent = "💬 Comment";
                card.appendChild(commentToggleBtn);

                const commentForm = document.createElement("form");
                commentForm.className = "comment-form";
                commentForm.style.display = "none";
                commentForm.innerHTML = `
                    <input type="text" class="comment-input" placeholder="Your comment..." required>
                    <button type="submit" class="send-comment-btn">Send</button>
                `;
                card.appendChild(commentForm);

                commentToggleBtn.onclick = () => {
                    commentForm.style.display = commentForm.style.display === "none" ? "flex" : "none";
                };

                commentForm.onsubmit = (e) => {
                    e.preventDefault();
                    const input = commentForm.querySelector(".comment-input");
                    if (input.value.trim()) {
                        // Hiển thị comment mới ngay bên dưới form
                        const newReply = document.createElement("div");
                        newReply.className = "reply";
                        newReply.innerHTML = `
                            <span class="reply-user">You</span>
                            <span class="reply-time">${new Date().toLocaleString()}</span>
                            <div>${input.value}</div>
                        `;
                        // Nếu chưa có reply-list thì tạo mới
                        let replyList = card.querySelector(".reply-list");
                        if (!replyList) {
                            replyList = document.createElement("div");
                            replyList.className = "reply-list";
                            card.appendChild(replyList);
                        }
                        replyList.appendChild(newReply);
                        input.value = "";
                        commentForm.style.display = "none";
                    }
                };
                feed.appendChild(card);
                
                setTimeout(() => {
                    const hash = window.location.hash;
                    if (hash && hash.startsWith('#comment-')) {
                        const target = document.querySelector(hash);
                        if (target) {
                            target.scrollIntoView({ behavior: "smooth", block: "center" });
                            target.style.boxShadow = "0 0 0 4px red";
                            setTimeout(() => {
                                target.style.boxShadow = "";
                            }, 2000);
                        }
                    }
                }, 100);
            });
        }
    });
});