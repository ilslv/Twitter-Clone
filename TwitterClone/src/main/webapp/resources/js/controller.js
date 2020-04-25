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
    var post = {};
    post.description = event.target.elements["description"].value;
    window.addPostInFront(post);
    event.target.elements["description"].value = '';
    event.preventDefault();
  }

  static loadMoreButton(event) {
    model.getPosts(controller.postsOnScreen, 10, currentFilter).forEach(post => {
      view.displayPost(post);
    });
    controller.postsOnScreen += 10;
  }

  static likeMouseOver(event) {
    let likesContainer = event.target.parentElement.previousElementSibling;
    if (likesContainer.firstElementChild) {
      likesContainer.classList.add('show');
    }
  }

  static likeMouseLeave(event) {
    let likesContainer = event.target.parentElement.previousElementSibling;
    likesContainer.classList.remove('show');
  }

  static likeClick(event) {
    if (currentAuthor.length > 0) {
      let id = event.target.parentElement.parentElement.id;
    
      let post = model.getPost(id);
      if (post.likes.indexOf(currentAuthor) != -1) {
        post.likes = post.likes.filter((username) => username != currentAuthor);
      } else {
        post.likes.push(currentAuthor);
      }
      localStorage.setItem(id, JSON.stringify(post));
      view.updatePost(id);
    }
  }

  static onFilterChanged(event) {
    let filterForm = view._filterForm;
    let dateFrom = filterForm.firstElementChild.firstElementChild;
    let dateTo = dateFrom.nextElementSibling.nextElementSibling;
    let authorSelect = filterForm.firstElementChild.nextElementSibling;
    let tagsSelect = authorSelect.nextElementSibling;

    let filter = {};

    filter.createdFromTo = []
    filter.createdFromTo.push(new Date(dateFrom.value));
    filter.createdFromTo.push(new Date(dateTo.value));

    let author = authorSelect[authorSelect.selectedIndex].value;
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
    let username = event.target.firstElementChild.firstElementChild.value;
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

  static displayAllAuthorsAndTags() {
    model.getPosts(0, model._posts.length).forEach((post) => {
      view.displayAuthor(post.author);
      view.displayTags(post.hashTags);
    });
  }
}

window.onload = () => {
  window.addPost = (post = {}) => {
    if(model.addPost(post)){
      view.displayPost(model.getPosts(0, 1)[0]);
    }
  };

  window.addPostInFront = (post = {}) => {
    if(model.addPost(post)){
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
      let post = {};
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

  if(currentAuthor.length === 0) {
    view._addPostForm.classList.add('hide');
  }

  view._userName.textContent = currentAuthor;
  view._loginLogoutButton.textContent = currentAuthor.length > 0 ? 'Выйти' : 'Войти';

  view.displayPosts(model.getPosts(0, 10, currentFilter));
  controller.displayAllAuthorsAndTags();
};
