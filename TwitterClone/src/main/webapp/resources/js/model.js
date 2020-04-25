let currentAuthor = 'Ilya';
const currentFilter = {};

class model {
      static _posts = [];

      static _postSchema = {
        id: (val) => typeof val === 'string',
        description: (val) => typeof val === 'string' && val.length < 200 && val.length > 0,
        createdAt: (val) => Object.prototype.toString.call(val) === '[object Date]',
        createdFromTo: (val) => Array.isArray(val),
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
            if (Array.isArray(filterConfig[property])) {
              if (property === 'createdFromTo') {
                const from = new Date(filterConfig[property][0].toDateString());
                const to = new Date(filterConfig[property][1].toDateString());
                const created = new Date(post.createdAt.toDateString());

                if (from > created || to < created) {
                  return false;
                }
              } else {
                for (const id in this.filterConfig[property]) {
                  if (!post[property].find((x) => x === this.filterConfig[property][id])) {
                    return false;
                  }
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
        if (!localPost.hasOwnProperty('author')) {
          localPost.author = currentAuthor;
        }
        if (!localPost.hasOwnProperty('id')) {
          localPost.id = (Number(model._getPostWithMaxId()?.id) + 1 || 1).toString();
        }
        if (!localPost.hasOwnProperty('createdAt')) {
          localPost.createdAt = new Date(Date.now());
        }
        if (!localPost.hasOwnProperty('likes')) {
          localPost.likes = [];
        }
        if (!localPost.hasOwnProperty('hashTags')) {
          localPost.hashTags = [];
        }

        const tagRegex = /#(\w)+/g;
        const tags = localPost.description.match(tagRegex);
        tags?.forEach((tag) => {
          const tagStripped = tag.substr(1);
          if (localPost.hashTags.indexOf(tagStripped) === -1) {
            localPost.hashTags.push(tagStripped);
          }
        });

        model._posts.push(localPost);
        localStorage.setItem(localPost.id, JSON.stringify(localPost));
        return true;
      }

      static removePost(id = '') {
        const l = model._posts.length;
        model._posts = model._posts.filter((post) => post.id !== id);
        localStorage.removeItem(id);

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

      static restoreFromLocalStorage() {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (Number.parseInt(key)) {
            const post = JSON.parse(localStorage.getItem(key));
            post.createdAt = new Date(post.createdAt);
            model._posts.push(post);
          }
        }
        currentAuthor = localStorage.getItem('author');
      }
}
model._postSchema.description.required = true;
