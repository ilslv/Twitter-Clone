class controller {
  static postsOnScreen = 10;

  static postsOnSinglePage = 10;

  static addImageButton(event) {
    event.target.nextElementSibling.click();
  }

  static showEditPopup(event) {
    event.target.parentElement.parentElement.firstElementChild.classList.add(
        'show',
    );
  }

  static hideEditPopup(event) {
    event.target.classList.remove('show');
  }

  static removePostView(event) {
    window.removePost(
        event.target.parentElement.parentElement.parentElement.id,
    );
  }

  static async addPostButton(event) {
    event.preventDefault();

    let post = {};
    post.description = event.target.elements.description.value;
    event.target.elements.description.value = '';

    if (post.description.length > 0) {
      try {
        post.photoLink = await model.uploadImage(event);
      } catch (e) {
        if (e.message !== 'No file found') {
          alert('Error: Failed image upload');
        }
      }

      window.addPostInFront(post);

    } else {
      alert('Error: empty post');
    }

  }

  static async loadMoreButton(event) {
    let posts = await model.getPosts(controller.postsOnScreen,
        controller.postsOnSinglePage, currentFilter);

    posts.forEach((post) => {
      view.displayPost(post);
    });

    controller.postsOnScreen += controller.postsOnSinglePage;
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

  static async likeClick(event) {
    if (currentAuthor.length > 0) {
      const {id} = event.target.parentElement.parentElement;

      await model.addLike(id, currentAuthor);

      view.updatePost(id);
    }
  }

  static async onFilterChanged(event) {
    const filterForm = view._filterForm;
    const dateFrom = filterForm.firstElementChild.firstElementChild;
    const dateTo = dateFrom.nextElementSibling.nextElementSibling;
    const authorSelect = filterForm.firstElementChild.nextElementSibling;
    const tagsSelect = authorSelect.nextElementSibling;

    const filter = {};

    filter.createdFrom = new Date(dateFrom.value);
    filter.createdTo = new Date(dateTo.value);

    const author = authorSelect[authorSelect.selectedIndex].value;
    if (author.length > 0) {
      filter.author = author;
    }

    filter.hashTags = [...tagsSelect.options].filter(
        (option) => option.selected && option.value.length > 0,
    ).map((option) => option.value);

    currentFilter = filter;

    view.removeAllPosts();

    const posts = await model.getPosts(0, controller.postsOnSinglePage,
        currentFilter);

    view.displayPosts(posts);

    controller.postsOnScreen = controller.postsOnSinglePage;
  }

  static async loginLogout(event) {
    if (currentAuthor.length > 0) {
      currentAuthor = '';
      localStorage.setItem('author', '');

      view._userName.textContent = '';
      view._loginLogoutButton.textContent = 'Войти';
      view.removeAllPosts();

      let posts = await model.getPosts(0, controller.postsOnSinglePage,
          currentFilter);
      view.displayPosts(posts);

      controller.postsOnScreen = controller.postsOnSinglePage;
      view._addPostForm.classList.add('hide');
    } else {
      view._loginForm.classList.add('show');
    }
  }

  static async loginFormSubmit(event) {
    event.preventDefault();

    const username = event.target.firstElementChild.firstElementChild.value;
    localStorage.setItem('author', username);

    if (await model.findUsername(username)) {
      view._loginLogoutButton.textContent = 'Выйти';
      view._userName.textContent = username;
      currentAuthor = username;
      view.removeAllPosts();

      const posts = await model.getPosts(0, controller.postsOnSinglePage,
          currentFilter);
      view.displayPosts(posts);

      controller.postsOnScreen = controller.postsOnSinglePage;

      event.target.classList.remove('show');
      view._addPostForm.classList.remove('hide');
    } else {
      alert('Error: user not found');
    }
  }

  static editCanceled(event) {
    event.preventDefault();
    view.updatePost(event.target.id);
  }

  static async editFormSubmit(event) {
    event.preventDefault();

    const post = {};
    post.description = event.target.elements.description.value;
    post.id = event.target.id;

    try {
      post.photoLink = await model.uploadImage(event);
    } catch (e) {
      if (e.message !== 'No file found') {
        alert('Error: Failed image upload');
      }
    }

    const editedPost = await model.editPost(post.id, post).
        catch(() => alert('Error: post edit failed'));

    view.updatePost(event.target.id);
    view.displayTags(editedPost.hashTags);
  }

  static async editButtonClick(event) {
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

    const post = await model.getPost(postView.id);
    editView.elements.description.value = post.description;

    editView.addEventListener('reset', controller.editCanceled);
    editView.addEventListener('submit', controller.editFormSubmit);
    editView.elements['add-file'].addEventListener('click', controller.addImageButton);

    postView.replaceWith(editView);
  }

  static async displayAllAuthorsAndTags() {
    const authors = await model.getAllAuthors();

    authors.forEach((author) => {
      view.displayAuthor(author);
    });

    const tags = await model.getAllTags();

    view.displayTags(tags);
  }
}

window.onload = async () => {
  // Binding functions to window
  window.addPost = async (post = {}) => {
    view.displayPost(await model.addPost(post));
  };

  window.addPostInFront = async (post = {}) => {
    view.displayPostInFront(await model.addPost(post));
  };

  window.removePost = async (id = 0) => {
    await model.removePost(id);
    view.removePost(id);
  };

  window.editPost = async (id = 0, post = {}) => {
    await model.editPost(id, post);
    await view.updatePost(id);
  };

  // Adding callbacks and text content to page elements
  view._addPostForm.addEventListener('submit', controller.addPostButton);
  view._loadMoreButton.addEventListener('click', controller.loadMoreButton);
  view._filterForm.addEventListener('change', controller.onFilterChanged);
  view._loginLogoutButton.addEventListener('click', controller.loginLogout);
  view._loginForm.addEventListener('mouseleave', controller.hideEditPopup);
  view._loginForm.addEventListener('submit', controller.loginFormSubmit);
  view._addPostForm.elements['add-file'].addEventListener('click', controller.addImageButton);

  currentAuthor = localStorage.getItem('author') || '';

  if (currentAuthor.length === 0) {
    view._addPostForm.classList.add('hide');
  }

  view._userName.textContent = currentAuthor;
  view._loginLogoutButton.textContent = currentAuthor.length > 0
      ? 'Выйти'
      : 'Войти';

  view.displayPosts(
      await model.getPosts(0, controller.postsOnSinglePage, currentFilter),
  );
  await controller.displayAllAuthorsAndTags();
};
