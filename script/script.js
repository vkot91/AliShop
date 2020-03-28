document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".search"),
    //Basket elements
    basket = document.querySelector(".cart"),
    basketBtn = document.getElementById("cart"),
    basketCounter = basketBtn.querySelector(".counter"),
    basketWrapper = document.querySelector(".cart-wrapper"),
    totalPrice = document.querySelector(".cart-total"),
    //WishList Elements
    wishListBtn = document.getElementById("wishlist"),
    wishlistCounter = wishListBtn.querySelector(".counter");
  //Карточки товаров
  const goodsWrapper = document.querySelector(".goods-wrapper");

  //Categories
  const category = document.querySelector(".category");

  //Избранные товары
  let wishlist = [];
  let productsBasket = {};
  console.log(productsBasket);
  //Сохранение товаров в LocalStorage избранное
  const storageQuery = get => {
    //Stringify - что-бы создать массив
    if (get) {
      //Проверка на то есть ли товар вообще в избранном
      if (localStorage.getItem("wishlist")) {
        const wishListStorage = JSON.parse(localStorage.getItem("wishlist"));
        wishListStorage.forEach(id => wishlist.push(id));
      }
    } else {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
    checkCount();
  };

  // Добавление товаров в localStorage корзины
  const storageQueryToBasket = get => {
    if (get) {
      //Проверка на то есть ли товар вообще в избранном
      if (localStorage.getItem("basket")) {
        const basketStorage = JSON.parse(localStorage.getItem("basket"));
        basketStorage.forEach(id => (productsBasket[id] = 1));
      }
    } else {
      localStorage.setItem(
        "basket",
        JSON.stringify(Object.keys(productsBasket))
      );
    }
    checkCount();
  };
  //Добавляем спиннер пока товары не загрузились
  const loading = () => {
    goodsWrapper.innerHTML = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
    </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>`;
  };

  //Работа с базой даных(локальной) получаем ответ и возвращаем данные
  const getProducts = (handler, filter) => {
    //Добавляем спиннер пока товары не загрузились
    loading();
    //Добавление товаров
    //Сначала кидаем товары в фильтер что бы открывалось по категориях
    fetch("./db/db.json")
      .then(response => {
        return response.json();
      })
      .then(filter)
      .then(handler);
  };

  //Создание карточки товара
  const createProduct = (id, title, price, img) => {
    const card = document.createElement("div");
    card.className = "card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3";
    card.innerHTML = `
    <div class="card">
      <div class="card-img-wrapper">
        <img class="card-img-top" src="${img}" alt="" />
        <button class="card-add-wishlist ${
          //Проверка для добавления доп.класса
          //Можно использовать indexOf или includes
          wishlist.includes(id) ? "active" : ""
        }" 
        data-product-id="${id}"></button>
      </div>
      <div class="card-body justify-content-between">
        <a href="#" class="card-title">${title}</a>
        <div class="card-price">${price} $</div>
        <div>
          <button class="card-add-cart" data-product-id="${id}">
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  `;
    return card;
  };

  //Вывод карточок из базы даных
  const renderCard = items => {
    goodsWrapper.textContent = "";
    //Проверяем есть ли товары
    if (items.length > 0) {
      items.forEach(item => {
        const { id, title, price, imgMin } = item;
        //Прокидуем товар
        goodsWrapper.appendChild(createProduct(id, title, price, imgMin));
      });
      //Проверка для поиска
    } else {
      goodsWrapper.textContent = "❌ NO PRODUCTS FOUND BY YOUR QUERY";
    }
  };

  // //Каждый раз товары будут открываться на странице рандомно
  // const randomSort = items => {
  //   return items.sort(() => Math.random() - 0.5);
  // };

  //Cортировка товара по категориям
  const chooseCategory = event => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains("category-item")) {
      const DOMcategory = target.dataset.category;
      //В getProducts второе значение это анонимная функция filter
      getProducts(renderCard, items => {
        const newItems = items.filter(item => {
          // у filter должен быть return
          //includes  - метод массива который возращает true (если есть такая категория ) или false (если нету)
          return item.category.includes(DOMcategory);
        });
        return newItems;
      });
    }
  };

  //Открытие корзины
  const openBasket = e => {
    e.preventDefault();
    getProducts(renderCardInBusket, items =>
      items.filter(item => Object.keys(productsBasket).includes(item.id))
    );
    basket.style.display = "flex";
    document.addEventListener("down", closeBasket);
  };

  //Закрытие корзины
  const closeBasket = e => {
    const target = e.target;
    if (target === basket || target.classList.contains("cart-close")) {
      basket.style.display = "";
      getProducts(renderCard);
    }
    //Закрытие по esc
    if (target.keyCode === 27) {
      basket.style.display = "";
      document.removeEventListener("keyup", closeBasket);
    }
  };

  /*Рендер товаров в корзине*/

  //Создание карточки товара
  const createProductInBusket = (id, title, price, img) => {
    const card = document.createElement("div");
    card.className = "goods";
    card.innerHTML = `
    <div class="goods-img-wrapper">
    <img class="goods-img" src="${img}" alt="" />
  </div>
  <div class="goods-description">
    <h2 class="goods-title">${title}</h2>
    <p class="goods-price">${price} $</p>
  </div>
  <div class="goods-price-count">
    <div class="goods-trigger">
      <button class="goods-add-wishlist  ${
        //Проверка для добавления доп.класса
        //Можно использовать indexOf или includes
        wishlist.includes(id) ? "active" : ""
      }" data-basket-product-id="${id}"></button>
      <button class="goods-delete" data-basket-product-id="${id}"></button>
    </div>
    <div class="goods-count">${productsBasket[id]}</div>
  </div>
</div>
  `;
    return card;
  };

  //Вывод карточок из базы даных
  const renderCardInBusket = items => {
    basketWrapper.textContent = "";
    //Проверяем есть ли товары
    if (items.length > 0) {
      items.forEach(item => {
        const { id, title, price, imgMin } = item;
        //Прокидуем товар
        basketWrapper.appendChild(
          createProductInBusket(id, title, price, imgMin)
        );
      });
      //Проверка для поиска
    } else {
      basketWrapper.innerHTML = "❌ Your basket is empty";
    }
    calcPrice(items);
  };
  const calcPrice = items => {
    let sum = 0;
    items.forEach(item => {
      sum += item.price;

      sum = Math.round(sum);
    });
    totalPrice.innerHTML = `Total Price: <span>${sum}</span> USD;`;
  };
  //Поиск товаров
  const searchProducts = e => {
    e.preventDefault();
    //Обращие по id(последнее)
    const input = e.target.elements.searchGoods;
    //Trim убирает пробелы и слева и справа
    const inputValue = input.value.trim();
    if (inputValue !== "") {
      //СТРОКА ОБЯЗАТЕЛЬНА ДЛЯ ПОИСКА! RegExp  - регулярное выражение
      const searchString = new RegExp(inputValue, "i");
      console.log(searchString);
      //Без return не работает
      getProducts(renderCard, items => {
        return items.filter(item => {
          return searchString.test(item.title);
        });
      });
    } else {
      //Если ничего не написали то
      search.classList.add("error");
      //Добавляем и убираем класс через 2 секунды
      setTimeout(() => {
        search.classList.remove("error");
      }, 2000);
    }
    input.value = "";
  };
  //Добавление товара в избранное или корзину
  const handlerProducts = event => {
    const target = event.target;
    //Добавление в избранное
    if (target.classList.contains("card-add-wishlist")) {
      //productId  - дата атрибут в камелкейсе , target - наш элемент
      toggleWishList(target.dataset.productId, target);
    } else if (target.classList.contains("card-add-cart")) {
      addProductsToBasket(target.dataset.productId, target);
    }
  };
  const handlerBasket = event => {
    const target = event.target;
    console.log(target);
    if (target.classList.contains("goods-add-wishlist")) {
      toggleWishList(target.dataset.basketProductId, target);
    } else if (target.classList.contains("goods-delete")) {
      deleteProductFromBasket(target.dataset.basketProductId, target);
    }
  };
  //Вывод на страницу избранных товаров
  const showWishList = () => {
    getProducts(renderCard, items =>
      items.filter(item => wishlist.includes(item.id))
    );
  };

  //Проверка кол-ва элементoв в массиве для отображения на странице
  const checkCount = () => {
    wishlistCounter.textContent = wishlist.length;
    //Обьект перекидываем в массив и получаем длинну
    basketCounter.textContent = Object.keys(productsBasket).length;
  };
  //element нужен для идентификации сердечка и добавлении класса
  const toggleWishList = (id, element) => {
    //indexOf выдает всегда -1 в начале
    if (wishlist.indexOf(id) + 1) {
      //Удаление товара
      //1 - параметр индекс елемента  , 2 количество елементов
      wishlist.splice(wishlist.indexOf(id), 1);
      element.classList.remove("active");
    } else {
      //Добавляем товар
      element.classList.add("active");
      wishlist.push(id);
    }
    checkCount();
    storageQuery();
  };
  /*Добавление продуктов в корзину*/
  const addProductsToBasket = id => {
    if (productsBasket[id]) {
      productsBasket[id] += 1;
    } else {
      productsBasket[id] = 1;
    }
    console.log(productsBasket);
    checkCount();
    storageQueryToBasket();
  };

  basketBtn.addEventListener("click", openBasket);
  basket.addEventListener("click", closeBasket);
  category.addEventListener("click", chooseCategory);
  search.addEventListener("submit", searchProducts);
  goodsWrapper.addEventListener("click", handlerProducts);
  basketWrapper.addEventListener("click", handlerBasket);
  wishListBtn.addEventListener("click", showWishList);
  //Вызов функции рендера товаров
  getProducts(renderCard); //, randomSort);
  storageQuery(true);
  storageQueryToBasket(true);
});
