class view {
    static _postViewSchema = {
      id: (postView, post) => postView.firstElementChild.id = post.id,
      photoLink: (postView, post) => postView.querySelector('[data-target="photoLink"]').style = `background-image: url(${post.photoLink});`,
      description: (postView, post) => postView.querySelector('[data-target="description"]').textContent = post.description,
      createdAt: (postView, post) => postView.querySelector('[data-target="createdAt"]').textContent = post.createdAt,
      hashTags: (postView, post) => {
        const tagsContainer = postView.querySelector('[data-target="tags"]');

        post.hashTags.forEach((tag) => {
          const newTag = document.createElement('p');
          newTag.classList.add('tag');
          newTag.textContent = tag;
          tagsContainer.appendChild(newTag);
        });
      },
      author: (postView, post) => {
        if (post.author !== currentAuthor) {
          postView.querySelector('[class="fas fa-ellipsis-h"]').style = 'display: none;'
        } else {
            var editButton = postView.querySelector('[class="fas fa-ellipsis-h"]');
            editButton.addEventListener('click', controller.showEditPopup);

            var popup = editButton.parentElement.parentElement.firstElementChild;
            popup.addEventListener('mouseleave', controller.hideEditPopup);
            popup.querySelector('[class="delete-post"]').addEventListener('click', controller.removePostView);
        }

        postView.querySelector('[data-target="author"]').textContent = post.author;
      },
      likes: (postView, post) => {
        const likesContainer = postView.querySelector('[data-target="likes"]');

        post.likes.forEach((like) => {
          const newLike = document.createElement('p');
          newLike.textContent = like;
          likesContainer.appendChild(newLike);
        });

        let likeButton = postView.querySelector('[class="far fa-heart like"]');

        if (post.likes.indexOf(currentAuthor) != -1) {
          likeButton.classList.add('like-active');
        }
        
        likeButton.addEventListener('mouseover', controller.likeMouseOver);
        likeButton.addEventListener('mouseleave', controller.likeMouseLeave);
        likeButton.addEventListener('click', controller.likeClick)
      },
    }

    static _tags = [];
    static _authors = [];

    static displayPostInFront(post = {}) {
      if (!model.validatePost(post)) {
        return false;
      }

      this.postView = document.importNode(view._postTemplate.content, true);
      Object.keys(post).forEach((key) => view._postViewSchema[key]?.(this.postView, post));
      view._feedContainer.insertBefore(this.postView, view._feedContainer.firstElementChild.nextElementSibling);

      view.displayAuthor(post.author);
      view.displayTags(post.hashTags);
    }

    static displayPost(post = {}) {
      if (!model.validatePost(post)) {
        return false;
      }

      this.postView = document.importNode(view._postTemplate.content, true);
      Object.keys(post).forEach((key) => view._postViewSchema[key]?.(this.postView, post));
      view._feedContainer.insertBefore(this.postView, view._feedContainer.lastElementChild);
    }

    static displayPosts(posts = []) {
      posts.forEach((post) => view.displayPost(post));
    }

    static displayAuthor(author = '') {
      if (view._authors.indexOf(author) === -1 && author.length > 0) {
        view._authors.push(author);
        const authorView = document.createElement('option');
        authorView.value = author;
        authorView.textContent = author;
        view._authorSelect.appendChild(authorView);
      }
    }

    static displayTags(hashTags = []) {
      hashTags.forEach((tag) => {
        if (view._tags.indexOf(tag) === -1) {
          view._tags.push(tag);
          const tagView = document.createElement('option');
          tagView.value = tag;
          tagView.textContent = tag;
          view._tagsSelect.appendChild(tagView);
        }
      });
    }

    static removePost(id = '') {
        document.getElementById(id)?.remove();
    }

    static updatePost(id = '') {
      this.postView = document.importNode(view._postTemplate.content, true);
      const editedPost = model.getPost(id);
      Object.keys(editedPost).forEach((key) => view._postViewSchema[key]?.(this.postView, editedPost));
      document.getElementById(id).replaceWith(this.postView);
    }

    static removeAllPosts() {
      let post = view._feedContainer.firstElementChild.nextElementSibling;
      while (post.nextElementSibling != null) {
        let delPost = post;
        post = post.nextElementSibling;
        delPost.remove();
      }
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
  view._postTemplate = document.getElementById('post-template');
  view._feedContainer = document.getElementById('feed');
  view._authorSelect = document.getElementById('author-select');
  view._tagsSelect = document.getElementById('tags-select');
  view._filterForm = document.forms['filter'];
  view._addPostForm = document.forms['add'];
  view._loginForm = document.forms['login'];
  view._loadMoreButton = document.querySelector('[class="load-more"]');
  view._userName = document.getElementById('username');
  view._loginLogoutButton = document.getElementById('login-logout');
});
