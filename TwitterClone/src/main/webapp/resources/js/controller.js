class controller {
  static postsOnScreen = 10;

  static showEditPopup(event) {
    event.target.parentElement.parentElement.firstElementChild.classList.add('show');
  }

  static hideEditPopup(event) {
    event.target.classList.remove('show');
  }

  static removePostView(event) {
    window.removePost(event.target.parentElement.parentElement.parentElement.id);
  }

  static addPostButton(event) {
    const post = {};
    post.description = event.target.elements.description.value;
    window.addPostInFront(post);
    event.target.elements.description.value = '';
    event.preventDefault();
  }

  static loadMoreButton(event) {
    model.getPosts(controller.postsOnScreen, 10, currentFilter).forEach((post) => {
      view.displayPost(post);
    });
    controller.postsOnScreen += 10;
  }

  static likeMouseOver(event) {
    const likesContainer = event.target.parentElement.previousElementSibling;
    if (likesContainer.firstElementChild) {
      likesContainer.classList.add('show');
    }
  }

  static likeMouseLeave(event) {
    const likesContainer = event.target.parentElement.previousElementSibling;
    likesContainer.classList.remove('show');
  }

  static likeClick(event) {
    if (currentAuthor.length > 0) {
      const { id } = event.target.parentElement.parentElement;

      const post = model.getPost(id);
      if (post.likes.indexOf(currentAuthor) !== -1) {
        post.likes = post.likes.filter((username) => username !== currentAuthor);
      } else {
        post.likes.push(currentAuthor);
      }
      localStorage.setItem(id, JSON.stringify(post));
      view.updatePost(id);
    }
  }

  static onFilterChanged(event) {
    const filterForm = view._filterForm;
    const dateFrom = filterForm.firstElementChild.firstElementChild;
    const dateTo = dateFrom.nextElementSibling.nextElementSibling;
    const authorSelect = filterForm.firstElementChild.nextElementSibling;
    const tagsSelect = authorSelect.nextElementSibling;

    const filter = {};

    filter.createdFromTo = [];
    filter.createdFromTo.push(new Date(dateFrom.value));
    filter.createdFromTo.push(new Date(dateTo.value));

    const author = authorSelect[authorSelect.selectedIndex].value;
    if (author.length > 0) {
      filter.author = author;
    }

    filter.hashTags = [...tagsSelect.options].filter((option) => option.selected && option.value.length > 0).map((option) => option.value);

    currentFilter = filter;
    view.removeAllPosts();
    view.displayPosts(model.getPosts(0, 10, currentFilter));
    controller.postsOnScreen = 10;
  }

  static loginLogout(event) {
    if (currentAuthor.length > 0) {
      currentAuthor = '';
      localStorage.setItem('author', '');
      view._userName.textContent = '';
      view._loginLogoutButton.textContent = 'Войти';
      view.removeAllPosts();
      view.displayPosts(model.getPosts(0, 10, currentFilter));
      controller.postsOnScreen = 10;
      view._addPostForm.classList.add('hide');
    } else {
      view._loginForm.classList.add('show');
    }
  }

  static loginFormSubmit(event) {
    const username = event.target.firstElementChild.firstElementChild.value;
    if (username.length > 0) {
      view._loginLogoutButton.textContent = 'Выйти';
      view._userName.textContent = username;
      currentAuthor = username;
      localStorage.setItem('author', username);
      view.removeAllPosts();
      view.displayPosts(model.getPosts(0, 10, currentFilter));
      controller.postsOnScreen = 10;

      event.target.classList.remove('show');
      view._addPostForm.classList.remove('hide');
    }
    event.preventDefault();
  }

  static editCanceled(event) {
    view.updatePost(event.target.id);
    event.preventDefault();
  }

  static editFormSubmit(event) {
    const description = event.target.elements.description.value;
    const post = model.getPost(event.target.id);
    post.description = description;
    delete post.hashTags;

    model.removePost(post.id);
    model.addPost(post);

    view.updatePost(event.target.id);
    view.displayTags(model.getPost(post.id).hashTags);
    event.preventDefault();
  }

  static editButtonClick(event) {
    const postView = event.target.parentElement.parentElement.parentElement;

    const editView = document.importNode(view._addPostForm, true);
    editView.id = postView.id;
    editView.querySelector('[class="add-post-button"]').value = 'Изменить';

    const button = document.createElement('input');
    button.type = 'reset';
    button.value = 'Отменить';
    button.classList.add('add-post-button');
    button.style = 'background: var(--bg);';
    editView.lastElementChild.appendChild(button);

    editView.name = '';
    editView.elements.description.value = model.getPost(postView.id).description;

    editView.addEventListener('reset', controller.editCanceled);
    editView.addEventListener('submit', controller.editFormSubmit);

    postView.replaceWith(editView);
  }

  static displayAllAuthorsAndTags() {
    model.getPosts(0, model._posts.length).forEach((post) => {
      view.displayAuthor(post.author);
      view.displayTags(post.hashTags);
    });
  }
}

window.onload = () => {
  window.addPost = (post = {}) => {
    if (model.addPost(post)) {
      view.displayPost(model.getPosts(0, 1)[0]);
    }
  };

  window.addPostInFront = (post = {}) => {
    if (model.addPost(post)) {
      view.displayPostInFront(model.getPosts(0, 1)[0]);
    }
  };

  window.removePost = (id = '') => {
    model.removePost(id);
    view.removePost(id);
  };

  window.editPost = (id = '', post = {}) => {
    model.editPost(id, post);
    view.updatePost(id);
  };

  view._addPostForm.addEventListener('submit', controller.addPostButton);
  view._loadMoreButton.addEventListener('click', controller.loadMoreButton);
  view._filterForm.addEventListener('change', controller.onFilterChanged);
  view._loginLogoutButton.addEventListener('click', controller.loginLogout);
  view._loginForm.addEventListener('mouseleave', controller.hideEditPopup);
  view._loginForm.addEventListener('submit', controller.loginFormSubmit);

  // Initial posts
  if (localStorage.getItem('author') === null) {
    for (let i = 1; i <= 25; i++) {
      const post = {};
      post.description = `test${i}`;
      post.likes = [];
      if (i === 1) {
        post.likes.push('Ilya');
        post.photoLink = 'https://images.unsplash.com/photo-1586806828012-032f518d2192?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60';
      }
      if (i < 5) {
        post.likes.push('someone');
        post.description += ' #tag1 #tag2';
      }
      model.addPost(post);
    }
    localStorage.setItem('author', currentAuthor);
  } else {
    currentAuthor = localStorage.getItem('author');
    model.restoreFromLocalStorage();
  }

  if (currentAuthor.length === 0) {
    view._addPostForm.classList.add('hide');
  }

  view._userName.textContent = currentAuthor;
  view._loginLogoutButton.textContent = currentAuthor.length > 0 ? 'Выйти' : 'Войти';

  view.displayPosts(model.getPosts(0, 10, currentFilter));
  controller.displayAllAuthorsAndTags();
};
