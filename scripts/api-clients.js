class RestaurantClient {

    constructor(apiKey = '') {
        this.baseUrl = `http://exam-2020-1-api.std-900.ist.mospolytech.ru/api/data1`;
        this.apiKey = apiKey;
    }

    get = (page = 0, limit = 5, filter = () => true) => {
        return fetch(`${this.baseUrl}?api_key=${this.apiKey}`)
            .then(body => body.json())
            .then(body => body.filter(elem => filter(elem)))
            .then(filtered => filtered.sort((a, b) => b.rate - a.rate))
            .then(filtered => filtered.slice(page * limit, (page + 1) * limit));
    }

    getById = (id) => {
        return fetch(`${this.baseUrl}/${id}?api_key=${this.apiKey}`)
            .then(body => body.json());
    }

    count = (filter = () => true) => {
        return fetch(`${this.baseUrl}?api_key=${this.apiKey}`)
            .then(body => body.json())
            .then(body => body.filter(elem => filter(elem)))
            .then(body => body.length);
    };


}

class DishClientStub {

    dishes = [
        {
            id: 1,
            name: 'Шакшука',
            description: 'Блюдо из яиц, жаренных в соусе из помидоров, острого перца, лукa и приправ',
            photoLink: 'https://i2.wp.com/www.downshiftology.com/wp-content/uploads/2015/11/shakshuka-13.jpg'
        },
        {
            id: 2,
            name: 'Гамбургер',
            description: 'Рубленый бифштекс из натуральной цельной говядины на карамелизованной булочке, заправленной горчицей, кетчупом, луком и кусочком маринованного огурчика.',
            photoLink: 'https://img03.rl0.ru/eda/c620x415i/s1.eda.ru/StaticContent/Photos/160525131253/160602184657/p_O.jpg'
        },
        {
            id: 3,
            name: 'Пюре',
            description: 'Пюре из картофеля',
            photoLink: 'http://v.img.com.ua/b/600x500/f/28/28b3d5cd38502f8075723e25c69ba28f.jpg'
        },
        {
            id: 4,
            name: 'Котлета по-киевски',
            description: 'Котлета по-киевски готовится из отбитого куриного филе с начинкой из сливочного масла с зеленью и жарится в толстой панировке',
            photoLink: 'https://i.ytimg.com/vi/C-nt0yqz-0g/maxresdefault.jpg'
        },
        {
            id: 5,
            name: 'Борщ',
            description: 'Разновидность супа на основе свёклы, которая придаёт ему характерный красный цвет',
            photoLink: 'https://lh3.googleusercontent.com/proxy/bEEPbZ4YNWHEMTpw-xbAgsRZo1bmDW1_M9qjRXVIILnv58pGa1VZbZGoYZuQLjiYH75Gij13u2rY7JqaW8dKrhRGZn9BApqLz0yBaVGNR8jyHOXVCOnHsO775UXS8WBGhqM'
        },
        {
            id: 6,
            name: 'Щи',
            description: 'Разновидность заправочного супа, блюдо русской кухни.',
            photoLink: 'https://blog-food.ru/images/site/recipes/first-dishes/0280-schi/07.jpg'
        },
        {
            id: 7,
            name: 'Салат оливье',
            description: 'Популярный в России праздничный салат',
            photoLink: 'https://img.povar.ru/main/71/a7/1b/ab/salat_quotolivequot_klassicheskii_s_kolbasoi-286788.JPG'
        },
        {
            id: 8,
            name: 'Морс ягодный',
            description: 'Традиционный для русской кухни негазированный прохладительный напиток, ягодный сок, разбавленный водой и подслащенный',
            photoLink: 'https://www.gastronom.ru/binfiles/images/20190225/b7860bc0.jpg'
        },
        {
            id: 9,
            name: 'Чай с мятой',
            description: 'Водный настой из листьев мяты перечной, который не содержит кофеина',
            photoLink: 'https://poleznenko.ru/wp-content/uploads/2013/04/mjatnyj-chaj-pohudenie.jpg'
        },
        {
            id: 10,
            name: 'Булочка с корицей',
            description: 'Прекрасная выпечка к чаю, кофе, какао, молоку либо горячему шоколаду',
            photoLink: 'https://beregifiguru.ru/Storage/Food/%D0%91%D1%83%D0%BB%D0%BE%D1%87%D0%BA%D0%B0-%D1%81-%D0%BA%D0%BE%D1%80%D0%B8%D1%86%D0%B5%D0%B9-187170.jpg'
        }

    ]

    get() {
        return this.dishes;
    }

    getById(id) {
        return this.dishes.find(dish => dish.id === id);
    }

    getIndexById(id) {
        return this.dishes.findIndex(dish => dish.id === id) + 1;
    }

    getIdToDish() {
        const idToDish = new Map();
        this.get().forEach(dish => idToDish.set(dish.id, dish));
        return idToDish;
    }
}

