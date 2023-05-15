class ChangeSelect {
  constructor({ selector, hoverClass = "hoverClass" }) {
    this.isShow = false;
    this.selector = selector;
    document.querySelectorAll(selector).forEach((element) => {
      //   Get all class of select box
      this.allClassNames = element.classList.toString() || null;
      this.hoverClass = hoverClass;
      this.buttonElementWidth = element.offsetWidth;
      //   Mapping all name and value of option tags
      this.allOptions = [];
      element.querySelectorAll("option").forEach((optionTags) => {
        this.allOptions.push({
          text: optionTags.innerText,
          value: optionTags.value,
          selected:
            optionTags.hasAttribute("selected") ||
            optionTags.classList.contains("selected")
              ? true
              : false,
          disabled:
            optionTags.hasAttribute("disabled") ||
            optionTags.classList.contains("disabled")
              ? true
              : false,
        });
      });

      /**
       * This will help to rander vartual dom to then Local Dom
       * @param {Brother Element} element
       * @param {Vartual DOM String} markup
       * @returns
       */
      function appendMarkup(element, markup) {
        return new Promise(function (resolve, reject) {
          try {
            element.insertAdjacentHTML("afterend", markup.toString());
            resolve(true);
          } catch {
            reject(false);
          }
        });
      }

      //   Making Marcup for select box
      let selectId = `zyd_${this.#generateId()}`;
      let markupOfSelectBox = `
              <div id="${selectId}" class="zyd_selectBox">
                  <button class="zyd_selectButton ${
                    this.allClassNames ? this.allClassNames : ""
                  }"></button>
                      <ul class="zyd_selecOptions">
                          ${this.allOptions
                            .map(
                              (item) =>
                                `<li zydvalue="${item.value}"><button ${
                                  item.disabled ? "disabled" : ""
                                }
                                class="${item.selected ? "selected" : ""}"
                                style="padding: 0;margin: 0;width: 100%;background: transparent;border: none;outline: none;">${
                                  item.text
                                }</button></li>`
                            )
                            .join("")}
                      </ul>
              </div>
              `;
      appendMarkup(element, markupOfSelectBox)
        .then(() => {
          this.#selectBox(selectId);
        })
        .catch((err) => {
          console.log(err);
        });

      this.#hideElement(element);
    });
  }

  /**
   * This will help to hide a DOM Element
   * @param {HTMLElement} element
   */
  #hideElement(element) {
    element.style.cssText = `
                                  opacity : 0;
                                  visibility : hidden;
                                  position : absolute;
                                  left : -50000000px;
                              `;
  }
  /**
   * This will return unique id in every invocation
   * @returns
   */
  #generateId() {
    return (
      Math.random().toString(36).substring(2) +
      new Date().getTime().toString(36)
    );
  }

  /**
   * This method will handle all the operaton inside vertual dom
   * @param {Select Box Uuid} id
   */

  #selectBox(id) {
    let selectBox = document.querySelector(`#${id}`);
    let selectButton = selectBox.querySelector(".zyd_selectButton");
    let optionWrapper = selectBox.querySelector(".zyd_selecOptions");
    let allListItems = selectBox.querySelectorAll(".zyd_selecOptions button");

    selectButton.onclick = (e) => {
      e.preventDefault();
      this.#handleOpenOrClose(optionWrapper);
    };

    // Button Click Events
    allListItems.forEach((optItem) => {
      optItem.onclick = (event) => {
        event.preventDefault();
        // Remove all selected class from all item
        allListItems.forEach((item) => {
          item.classList.remove("selected");
          item.removeAttribute("selected");
        });
        // add Selected class to this element
        event.target.setAttribute("selected", "true");
        event.target.classList.add("selected");
        // Hide the Option bar
        this.#handleOpenOrClose(optionWrapper, false);

        // Update State Data
        this.#updateAllStateData(event);
        // Re Rander the selector
        this.#applyHoverStyleWithClass(allListItems);
      };
    });

    // Add additonal Class to button on Hover
    this.#applyHoverStyleWithClass(allListItems);
    this.#applyCss(
      selectBox,
      `
              position: relative;
         `
    );
    this.#applyCss(
      optionWrapper,
      `
          list-style: none;
          padding: 0;
          margin: 0;
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          padding: 10px;
          box-shadow: 0px 0px 20px rgba(0, 0, 30, 0.2);
          border-radius: 5px;
          width : ${this.buttonElementWidth}px;
          box-sizing : border-box;
          visibility : hidden;
          opacity : 0;
         `
    );
  }

  /**
   * This mathod will help to add css to the Local Dom
   * @param {HTMLElement} element
   * @param {Css String} css
   */
  #applyCss(element, css) {
    if (element != null) {
      element.style.cssText = css;
    }
  }

  /**
   * This mathod will gelp to handle hover functionality and updating main button inner text
   * @param {HTMLOptionElement} elements
   */
  #applyHoverStyleWithClass(elements) {
    // Change root button text on select
    let rootButton = elements[0]
      .closest(".zyd_selectBox")
      ?.querySelector("button");
    rootButton.innerText =
      this.allOptions.filter((item) => item.selected)[0]?.text ||
      this.allOptions[0]?.text;

    //   Adding hover style to all options
    elements.forEach((element) => {
      // Add some style
      element.style.cursor = "pointer";
      element.style.userSelect = "none";

      if (element.classList.contains("selected")) {
        element.style.backgroundColor = "orange";
      } else {
        element.style.backgroundColor = "unset";
      }

      if (this.hoverClass) {
        element.onmouseover = () => {
          this.#addExternalClass(element, this.hoverClass);
          element.parentNode.querySelector(
            `.${this.hoverClass}`
          ).style.backgroundColor = "orange";
        };
        element.onmouseleave = () => {
          element.parentNode.querySelector(
            `.${this.hoverClass}`
          ).style.backgroundColor = element.classList.contains("selected")
            ? "orange"
            : "unset";

          this.#addExternalClass(element, `${this.hoverClass}`, "remove");
        };
      }
    });
  }

  /**
   * This mathod will gelp to add/remove external class to the html element
   * @param {HTMLElement} element
   * @param {class} classes
   * @param {add or remove} type
   * @returns
   */
  #addExternalClass(element, classes, type = "add") {
    if (element == null) {
      return;
    }
    let allClasses = [element.classList];
    if (classes) {
      allClasses.push(classes);
    }

    if (type == "add") {
      element.classList = allClasses.join(" ");
    } else if (type === "remove") {
      element.classList.remove(classes);
    }
  }

  /**
   * This mathod will gelp to show or hide the options
   * @param {HTMLElement} wrapper
   * @param {boolean} val
   * @returns
   */
  #handleOpenOrClose(wrapper, val = null) {
    if (val) {
      if (typeof val !== "boolean") {
        return false;
      }
      this.isShow = val;
    } else {
      this.isShow = !this.isShow;
    }

    if (this.isShow) {
      wrapper?.classList.add("open");
      this.#handleCloseOrOpenStyle(wrapper);
    } else {
      wrapper?.classList.remove("open");
      this.#handleCloseOrOpenStyle(wrapper);
    }
  }
  /**
   * This mathod will gelp to add style for opening and closing option wrapper
   * @param {HTMLElement} wrapper
   */
  #handleCloseOrOpenStyle(wrapper) {
    if (this.isShow) {
      wrapper.style.visibility = "visible";
      wrapper.style.opacity = "1";
    } else {
      wrapper.style.visibility = "hidden";
      wrapper.style.opacity = "0";
    }
  }

  #updateAllStateData(event) {
    let value = event.target.closest("li").getAttribute("zydvalue");
    document.querySelectorAll(this.selector).forEach((element) => {
      // Change select tag value
      element.setAttribute("value", value);
      // Change option tag attribute
      element.querySelectorAll("option").forEach((optionTags) => {
        if (optionTags.value === value) {
          optionTags.setAttribute("selected", "true");
        } else {
          optionTags.removeAttribute("selected");
        }
      });
      //   Get all class of select box
      this.allClassNames = element.classList.toString() || null;
      this.buttonElementWidth = element.offsetWidth;
      this.allOptions = [];
      //   Mapping all name and value of option tags
      element.querySelectorAll("option").forEach((optionTags) => {
        this.allOptions.push({
          text: optionTags.innerText,
          value: optionTags.value,
          selected:
            optionTags.hasAttribute("selected") ||
            optionTags.classList.contains("selected")
              ? true
              : false,
          disabled:
            optionTags.hasAttribute("disabled") ||
            optionTags.classList.contains("disabled")
              ? true
              : false,
        });
      });
    });
  }
}
