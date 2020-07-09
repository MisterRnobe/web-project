const restaurantClient = new RestaurantClient('');
const dishClient = new DishClientStub();
const deliveryPrice = 250;
let selectedRestaurant = {};
const selectedDishIdToQuantity = new Map();
let selectedPresent = false;
let selectedGroupOrder = false;
let randomPresentDishIdx = -1;
const restaurantsPerPage = 20;

const info = (item) => {
    console.info(item);
    return item;
}

const onSelectRestaurant = async (id) => {
    const previousSelected = document.querySelector(`#restaurant-select-${selectedRestaurant.id}`);
    if (previousSelected) {
        previousSelected.disabled = false;
        previousSelected.innerText = 'Выбрать';
    }
    selectedRestaurant = await restaurantClient.getById(id);
    const currentSelected = document.querySelector(`#restaurant-select-${id}`);
    currentSelected.disabled = true;
    currentSelected.innerText = 'Выбрано';
    renderMenu();
};

const convertResponseToTableBody = (resp) => {
    return resp
        .map(elem => {
            const selected = elem.id === selectedRestaurant.id;
            return `<tr>
                <td>${elem.name}</td>
                <td>${elem.typeObject}</td>
                <td>${elem.admArea}</td>
                <td>${elem.district}</td>
                <td>${elem.address}</td>
                <td>${elem.rate}</td>
                <td>${elem.socialPrivileges === 1 ? 'Да' : 'Нет'}</td>
                <td>
                    <button ${selected ? 'disabled' : ''} class="btn btn-primary" id="restaurant-select-${elem.id}" type="button" onclick="onSelectRestaurant(${elem.id})">
                    ${selected ? 'Выбрано' : 'Выбрать'}
                    </button>
                </td>
            </tr>`
        })
        .join('');
}

let debug = {}

const filter = (admArea, district, type, discount) => {
    return (elem) => {
        return elem && elem.typeObject && elem.admArea && elem.district && (elem.socialPrivileges > -1) &&
            elem.typeObject.indexOf(type) !== -1 &&
            elem.district.indexOf(district) !== -1 &&
            elem.admArea.indexOf(admArea) !== -1 &&
            (discount === 0 || elem.socialPrivileges === 1);
    };
}

const renderPages = (currPage, lastPage) => {
    let pages;
    if (lastPage === 0) {
        pages = [];
    } else if (lastPage <= 4) {
        pages = [1, 2, 3, 4];
    } else if (currPage <= 3) {
        pages = [1, 2, 3, 4, '...', lastPage];
    } else {
        if (currPage > lastPage - 3) {
            //pages might look like 1, ..., 5, 6, 7, 8 if 6 or 7 or 8 is selected
            pages = [1, '...', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
        } else {
            //otherwise 1, 10, 11, 12, ... 100
            pages = [1, currPage - 1, currPage, currPage + 1, '...', lastPage];
        }
    }
    let pagesHtml = pages
        .map(page => {
            const onClick = page === '...'
                ? ''
                : `onclick="onClickFind(${page})"`;
            const disabled = page === '...' || page === currPage
                ? 'disabled'
                : '';
            return `<li class="page-item">
                    <button type="button" class="btn btn-link" ${onClick} ${disabled}>
                        ${page}
                    </button>
                </li>`
        })
        .join('');

    if (pagesHtml) {
        pagesHtml = `<nav>
            <ul class="pagination justify-content-center">
                <li class="page-item disabled">
                    <button type="button" class="btn-link btn" tabindex="-1" onclick="onClickFind(${currPage - 1})" ${currPage === 1 ? 'disabled' : ''} >Пред</button>
                </li>
                ${pagesHtml}
                <li class="page-item">
                    <button type="button" class="btn btn-link" onclick="onClickFind(${currPage + 1})" ${currPage === lastPage ? 'disabled' : ''}>След</button>
                </li>
            </ul>
        </nav>`
    }
    return pagesHtml;
};

const onClickFind = async (currentPage = 1) => {
    const admArea = document.querySelector('#adm-area').value;
    const district = document.querySelector('#district').value;
    const type = document.querySelector('#type').value;
    const discount = document.querySelector('#discount').checked ? 1 : 0;
    const bodyFilter = filter(admArea, district, type, discount);

    const restaurantsCount = await restaurantClient.count(bodyFilter);
    const pagesCount = Math.floor(restaurantsCount / restaurantsPerPage);
    const pagesHtml = renderPages(currentPage, pagesCount);

    const tbody = await restaurantClient.get(currentPage - 1, restaurantsPerPage, bodyFilter)
        .then(resp => (info(resp)))
        .then(resp => (convertResponseToTableBody(resp)));
    const element = document.querySelector('.restaurants');
    element.innerHTML = `<table class="table pink-with-turquoise mt-3">
            <thead>
                <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Тип</th>
                    <th scope="col">Округ</th>
                    <th scope="col">Район</th>
                    <th scope="col">Адрес</th>
                    <th scope="col">Рейтинг</th>
                    <th scope="col">Соц. скидка</th>
                    <th scope="col">Действия</th>
                </tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        ${pagesHtml}`;
};

const renderMenu = async () => {
    const menuHtml = dishClient.get()
        .map((menu, idx) => {
            const price = selectedRestaurant[`set_${idx + 1}`];
            return `<div class="col-4">
                <div class="pink-with-turquoise h-100">
                    <div class="row">
                        <div class="text-center col-12">
                        <h5>${menu.name}</h5>
                        </div>
                    </div>
                    <div class="row">
                        <div class="text-center col-12">
                            <img src="${menu.photoLink}" class="img-thumbnail" width="100px">
                        </div>
                    </div>
                    <div class="row">
                        <div class="text-center col-12">${menu.description}</div>
                    </div>
                    <div class="row">
                        <div class="text-center col-12 font-weight-bold">
                            ${price} RUR
                        </div>
                    </div>
                    <div class="container mt-1">
                         <div class="row align-self-end">
                             <div class="col-lg-2"></div>
                             <div class="col-lg-8 col-12">
                                 <div class="input-group mb-3">
                                     <div class="input-group-prepend">
                                         <button class="btn btn-dark btn-sm" onclick="onChangeDishQuantity(-1, ${menu.id})"><i class="fa fa-minus"></i></button>
                                     </div>
                                     <input type="number" id="qty_input-${menu.id}" class="form-control form-control-sm" value="0" min="0">
                                     <div class="input-group-prepend">
                                         <button class="btn btn-dark btn-sm" onclick="onChangeDishQuantity(1, ${menu.id})"><i class="fa fa-plus"></i></button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>`;
        })
        .reduce((prev, curr) => {
            if (prev.length === 0 || prev[prev.length - 1].length % 3 === 0) {
                prev.push([curr]);
            } else {
                prev[prev.length - 1].push(curr);
            }
            return prev;
        }, [])
        .map(arr => {
            return `<div class="row mt-1 mb-1">${arr.join('')}</div>`
        })
        .join('');
    const doc = document.querySelector('#menu-output');
    doc.innerHTML = `<h3 class="text-center">Меню</h3>${menuHtml}`;
};

const onChangeDishQuantity = (value, id) => {
    const inputElement = document.querySelector(`#qty_input-${id}`);
    const newValue = parseInt(inputElement.value) + value;
    if (newValue >= 0) {
        inputElement.value = newValue;
        selectedDishIdToQuantity.set(id, newValue);
    } else {
        selectedDishIdToQuantity.delete(id);
    }
    onOrderChange();
}

const computeOrderPrice = () => {
    const dishIdToPrice = dishClient.get()
        .reduce((prev, curr, idx) => {
            prev.set(curr.id, selectedRestaurant[`set_${idx + 1}`]);
            return prev;
        }, new Map());

    return Array.from(selectedDishIdToQuantity) // Array of arrays [[dishId, dishQuantity], ...]
        .reduce((accumulator, currentValue) => {
            const dishId = currentValue[0];
            const dishQuantity = currentValue[1];
            return accumulator + dishIdToPrice.get(dishId) * dishQuantity;
        }, 0)
}

const onOrderChange = () => {
    const orderPrice = computeOrderPrice();
    document.querySelector('#price').innerText = `Итого: ${orderPrice} RUR`;
    document.querySelector('[name="order-btn"]').disabled = orderPrice === 0;
}

const renderOrder = () => {
    return Array.from(selectedDishIdToQuantity)
        .map(element => {
            const dish = dishClient.getById(element[0]);
            const quantity = element[1];
            const price = selectedRestaurant[`set_${dishClient.getIndexById(element[0])}`];
            return `<div class="row">
                        <div class="col-2"><img class="img-thumbnail" src="${dish.photoLink}" alt="${dish.name}"></div>
                        <div class="col-4"><h5>${dish.name}</h5></div>     
                        <div class="col-3">${price}×${quantity}</div>     
                        <div class="col-3"><h5>${price * quantity} RUR</h5></div>     
                    </div>`
        })
        .join('');
};

const renderAdditionalOpts = () => {
    const presentHtml = selectedPresent
        ? `<div class="row">
                <div class="col-6">Хочу подарок</div>
                <div class="col-6">${dishClient.get()[randomPresentDishIdx].name} ${selectedRestaurant['set_' + (randomPresentDishIdx + 1)]}×1 RUR</div>
            </div>`
        : '';

    const groupOrderHtml = selectedGroupOrder
        ? `<div class="row">
                <div class="col-6">На компанию</div>
                <div class="col-6">-${computeOrderPrice() * 0.5} RUR</div>
            </div>`
        : '';
    return presentHtml + groupOrderHtml;
};

const renderRestaurant = () => {
    const restaurant = selectedRestaurant;
    return `<div class="row"><div class="col-6">Название</div><div class="col-6">${restaurant.name}</div></div>
            <div class="row"><div class="col-6">Административный округ</div><div class="col-6">${restaurant.admArea}</div></div>
            <div class="row"><div class="col-6">Район</div><div class="col-6">${restaurant.district}</div></div>
            <div class="row"><div class="col-6">Адрес</div><div class="col-6">${restaurant.address}</div></div>
            <div class="row"><div class="col-6">Рейтинг</div><div class="col-6">${restaurant.rate}</div></div>`;
};
const computeTotalPrice = () => {
    return deliveryPrice + computeOrderPrice() *
        (selectedGroupOrder ? 0.5 : 1) +
        (selectedPresent ? selectedRestaurant[`set_${randomPresentDishIdx + 1}`] : 0);
};

const onClickOrder = () => {
    if (selectedPresent) {
        randomPresentDishIdx = Math.floor(Math.random() * 10);
    }

    if (selectedGroupOrder) {
        selectedDishIdToQuantity.forEach((v, k) => selectedDishIdToQuantity.set(k, v * 5));
    }

    const renderedOrder = renderOrder();
    const renderedAdditionalOpts = renderAdditionalOpts();
    const renderedRestaurant = renderRestaurant();
    const totalPrice = computeTotalPrice();

    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `
    <div class="container">
        <h4>Ваш заказ</h4>
        ${renderedOrder}
    </div>
    <div class="container">
        <h4>Дополнительные опции</h4>
        ${renderedAdditionalOpts}
    </div>
    <div class="container">
        <h4>Информация о предприятии</h4>
        ${renderedRestaurant}
    </div>
    <div class="container">
        <h5>Доставка</h5>
        <form>
          <div class="form-group row">
            <label for="delivery-address" class="col-sm-4 col-form-label">Адрес доставки</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="delivery-address">
            </div>
          </div>
          <div class="form-group row">
            <label for="delivery-name" class="col-sm-4 col-form-label">ФИО получателя</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="delivery-name">
            </div>
          </div>
        <div class="form-group row">
            <label for="delivery-price" class="col-sm-4 col-form-label">Стоимость доставки</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="delivery-price" disabled value="${deliveryPrice} RUR">
            </div>
          </div>
        </form>
    </div>
    <div class="container">
        <h5>Итого: ${totalPrice} RUR</h5>
    </div>
`;
}
