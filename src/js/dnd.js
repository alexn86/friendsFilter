'use strict';

let DragManager = new function () {
    let dragObject = {};
    let self = this;

    function onMouseDown(e) {

        if (e.which != 1) return;

        let elem = e.target.closest('.draggable');
        if (!elem) return;

        dragObject.elem = elem;

        // запомним, что элемент нажат на текущих координатах pageX/pageY
        dragObject.downX = e.pageX;
        dragObject.downY = e.pageY;

        return false;
    }

    function onMouseMove(e) {
        if (!dragObject.elem) return; // элемент не зажат

        if (!dragObject.avatar) { // если перенос не начат...
            let moveX = e.pageX - dragObject.downX;
            let moveY = e.pageY - dragObject.downY;

            // если мышь передвинулась в нажатом состоянии недостаточно далеко
            if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                return;
            }

            // начинаем перенос
            dragObject.avatar = createAvatar(e); // создать аватар
            if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
                dragObject = {};
                return;
            }

            // аватар создан успешно
            // создать вспомогательные свойства shiftX/shiftY
            let coords = getCoords(dragObject.avatar);
            dragObject.shiftX = dragObject.downX - coords.left;
            dragObject.shiftY = dragObject.downY - coords.top;

            startDrag(e); // отобразить начало переноса
        }

        // отобразить перенос объекта при каждом движении мыши
        dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
        dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

        return false;
    }

    function onMouseUp(e) {
        if (dragObject.avatar) { // если перенос идет
            finishDrag(e);
        }

        // перенос либо не начинался, либо завершился
        // в любом случае очистим "состояние переноса" dragObject
        dragObject = {};
    }

    function finishDrag(e) {
        let dropElem = findDroppable(e);

        if (!dropElem) {
            self.onDragCancel(dragObject);
        } else {
            self.onDragEnd(dragObject, dropElem);
        }
    }

    function createAvatar(e) {

        let old = {
            backgroundColor: dragObject.elem.style.backgroundColor
        };

        let style = getComputedStyle(dragObject.elem);
        let avatar = dragObject.elem.cloneNode(true);
        avatar.style.position = 'absolute';
        avatar.style.width = dragObject.elem.offsetWidth + 'px';
        avatar.style.height = dragObject.elem.offsetHeight + 'px';
        avatar.style.backgroundColor = style.backgroundColor;
        dragObject.elem.style.backgroundColor = style.backgroundColor;
        let elemCoords = getCoords(dragObject.elem);
        avatar.style.left = elemCoords.left + 'px';
        avatar.style.top = elemCoords.top + 'px';
        document.body.appendChild(avatar);

        avatar.destroy = function () {
            document.body.removeChild(avatar);
            avatar = null;
            dragObject.elem.style.backgroundColor = old.backgroundColor;
        };

        // функция для отмены переноса
        avatar.rollback = function () {
            //при отмене просто уничтожаем аватар
            avatar.destroy();
        };

        return avatar;
    }

    function startDrag(e) {
        let avatar = dragObject.avatar;

        // инициировать начало переноса
        document.body.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
    }

    function findDroppable(event) {
        // спрячем переносимый элемент
        let z = dragObject.avatar.style.zIndex;
        dragObject.avatar.style.zIndex = -9999;

        // получить самый вложенный элемент под курсором мыши
        let elem = document.elementFromPoint(event.clientX, event.clientY);
        // показать переносимый элемент обратно
        dragObject.avatar.style.zIndex = z;

        if (elem == null) {
            // такое возможно, если курсор мыши "вылетел" за границу окна
            return null;
        }

        return elem.closest('.droppable');
    }

    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    document.onmousedown = onMouseDown;

    this.onDragEnd = function (dragObject, dropElem) {
    };
    this.onDragCancel = function (dragObject) {
    };

};

let getCoords = (elem) => { // кроме IE8-
    let box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
};

module.exports = DragManager;
