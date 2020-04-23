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
    model.getPosts(controller.postsOnScreen).forEach(post => {
      view.displayPost(post);
    });
    controller.postsOnScreen += 10;
  }

  static likeMouseOver(event) {
    let likesContainer = event.target.parentElement.previousSibling.previousSibling;
    if (likesContainer.firstElementChild) {
      likesContainer.classList.add('show');
    }
  }

  static likeMouseLeave(event) {
    let likesContainer = event.target.parentElement.previousSibling.previousSibling;
    likesContainer.classList.remove('show');
  }

  static likeClick(event) {
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

  var addPostForm = document.forms["add"];
  addPostForm.addEventListener('submit', controller.addPostButton);

  var loadMoreButton = document.querySelector('[class="load-more"]');
  loadMoreButton.addEventListener('click', controller.loadMoreButton);

  // Initial posts
  if (!localStorage.getItem('author')) {
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
    model.restoreFromLocalStorage();
  }
  

  view.displayPosts(model.getPosts());
  controller.displayAllAuthorsAndTags();
};
