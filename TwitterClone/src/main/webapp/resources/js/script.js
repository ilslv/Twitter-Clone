window.onload = () => {
  const currentAuthor = 'Ilya';

  class model {
      static _posts = [];

      static _postSchema = {
        id: (val) => typeof val === 'string',
        description: (val) => typeof val === 'string' && val.length < 200,
        createdAt: (val) => Object.prototype.toString.call(val) === '[object Date]',
        author: (val) => typeof val === 'string' && val.length > 0,
        photoLink: (val) => typeof val === 'string',
        hashTags: (val) => Array.isArray(val),
        likes: (val) => Array.isArray(val),
      };

      static _validateSchema(validateOver = {}, post = {}) {
        if (Object.keys(validateOver).filter((key) => model._postSchema[key]?.required).length
              !== Object.keys(post).filter((key) => model._postSchema[key]?.required).length) {
          console.log('Mismatching number of keys!');
          return false;
        }

        this.post = post;
        const errors = Object.keys(validateOver)
          .filter((key) => this.post.hasOwnProperty(key) && !model._postSchema[key]?.(this.post[key]))
          .map((key) => new Error(`${key} is invalid!`));

        if (errors.length > 0) {
          errors.forEach((error) => console.log(error.message));
          return false;
        }

        return true;
      }

      static _getPostWithMaxId() {
        return model._posts.length === 0 ? null : model._posts.reduce((prev, cur) => (Number.parseInt(prev.id) > Number.parseInt(cur.id) ? prev : cur));
      }

      static validatePost(post = {}) {
        return model._validateSchema(model._postSchema, post);
      }

      static getPosts(skip = 0, top = 10, filterConfig = {}) {
        if (!model._validateSchema(filterConfig, filterConfig)) {
          console.log('Wrong filterConfig type!');
          return [];
        }

        this.filterConfig = filterConfig;

        const result = model._posts.filter((post) => {
          for (const property in this.filterConfig) {
            if (Array.isArray(post[property])) {
              for (const id in this.filterConfig[property]) {
                if (!post[property].find((x) => x === this.filterConfig[property][id])) {
                  return false;
                }
              }
            } else if (post[property] !== this.filterConfig[property]) {
              return false;
            }
          }

          return true;
        });

        return result.sort((l, r) => r.createdAt - l.createdAt).slice(skip, skip + top);
      }

      static getPost(id = 0) {
        return model._posts.find((post) => post.id === id);
      }

      static addPost(post = {}) {
        if (!model.validatePost(post)) {
          return false;
        }

        const localPost = { ...post };
        localPost.author = currentAuthor;
        localPost.id = (Number(model._getPostWithMaxId()?.id) + 1 || 1).toString();
        localPost.createdAt = new Date(Date.now());

        model._posts.push(localPost);
        return true;
      }

      static removePost(id = '') {
        const l = model._posts.length;
        model._posts = model._posts.filter((post) => post.id !== id);

        return l !== model._posts.length;
      }

      static editPost(id = '', post = {}) {
        const curPost = model.getPost(id);
        if (!curPost || !model._validateSchema(post, post)) {
          return false;
        }

        Object.keys(post)
          .forEach((key) => curPost[key] = post[key]);

        return true;
      }

      static addAll(posts = []) {
        return posts.filter((post) => !model.addPost(post));
      }

      static clear() {
        model._posts = [];
      }
  }
  model._postSchema.description.required = true;

  class view {
      static _postTemplate = document.getElementById('post-template');

      static _feedContainer = document.getElementById('feed');

      static _authorSelect = document.getElementById('author-select');

      static _tagsSelect = document.getElementById('tags-select');

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
          if (post.author === currentAuthor) {
            const editButton = document.createElement('button');
            editButton.classList.add('fas', 'fa-ellipsis-h');
            postView.querySelector('[class="top"]').appendChild(editButton);
          }
          postView.querySelector('[data-target="author"]').textContent = post.author;
        },
        // Because of design constrains likes are skipped for now
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

      static displayAuthors() {
        const authors = [...new Set(model._posts.map((post) => post.author))];
        authors.forEach((author) => {
          const authorView = document.createElement('option');
          authorView.value = author;
          authorView.textContent = author;
          view._authorSelect.appendChild(authorView);
        });
      }

      static displayTags() {
        this.allTags = [];
        model._posts.forEach((post) => post.hashTags.forEach((tag) => this.allTags.push(tag)));
        const uniqueTags = [...new Set(this.allTags)];

        uniqueTags.forEach((tag) => {
          const tagView = document.createElement('option');
          tagView.value = tag;
          tagView.textContent = tag;
          view._tagsSelect.appendChild(tagView);
        });
      }

      static removePost(id = '') {
          document.getElementById(id)?.remove();
      }

      static editPost(id = '', post = {}) {
        this.postView = document.importNode(view._postTemplate.content, true);
        model.editPost(id, post);
        const editedPost = model.getPost(id);
        Object.keys(editedPost).forEach((key) => view._postViewSchema[key]?.(this.postView, editedPost));
        document.getElementById(id).replaceWith(this.postView);
      }

      static refreshPage() {
        view.displayTags();
        view.displayAuthors();
        view.displayPosts(model.getPosts());
      }
  }

  window.addPost = (post = {}) => {
    model.addPost(post);
    view.displayPost(post);
  };

  window.removePost = (id = '') => {
    model.removePost(id);
    view.removePost(id);
  };

  window.editPost = (id = '', post = {}) => view.editPost(id, post);

  // Initial posts
  model.addAll([{
    description: 'test16',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  },
  {
    description: 'test17',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  }]);
  view.refreshPage();
};
