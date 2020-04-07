const currentAuthor = 'Ilya';

class api {
    _posts = [];

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
      if (Object.keys(validateOver).filter((key) => api._postSchema[key]?.required).length
            !== Object.keys(post).filter((key) => api._postSchema[key]?.required).length) {
        console.log('Mismatching number of keys!');
        return false;
      }

      this.post = post;
      const errors = Object.keys(validateOver)
        .filter((key) => this.post.hasOwnProperty(key) && !api._postSchema[key]?.(this.post[key]))
        .map((key) => new Error(`${key} is invalid!`));

      if (errors.length > 0) {
        errors.forEach((error) => console.log(error.message));
        return false;
      }

      return true;
    }

    _getPostWithMaxId() {
      return this._posts.reduce((prev, cur) => (Number.parseInt(prev.id) > Number.parseInt(cur.id) ? prev : cur));
    }

    static validatePost(post = {}) {
      return api._validateSchema(api._postSchema, post);
    }

    getPosts(skip = 0, top = 10, filterConfig = {}) {
      if (!api._validateSchema(filterConfig, filterConfig)) {
        console.log('Wrong filterConfig type!');
        return [];
      }

      this.filterConfig = filterConfig;

      const result = this._posts.filter((post) => {
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

    getPost(id = 0) {
      return this._posts.find((post) => post.id === id);
    }

    addPost(post = {}) {
      if (!api.validatePost(post)) {
        return false;
      }

      const localPost = { ...post };
      localPost.author = currentAuthor;
      localPost.id = (Number.parseInt(this._getPostWithMaxId().id) + 1).toString();
      localPost.createdAt = new Date(Date.now());

      this._posts.push(localPost);
      return true;
    }

    removePost(id = '') {
      const l = this._posts.length;
      this._posts = this._posts.filter((post) => post.id !== id);

      return l !== this._posts.length;
    }

    editPost(id = 0, post = {}) {
      const curPost = this.getPost(id);
      if (!curPost || !api._validateSchema(post, post)) {
        return false;
      }

      Object.keys(post)
        .forEach((key) => curPost[key] = post[key]);

      return true;
    }

    addAll(posts = []) {
      return posts.filter((post) => !this.addPost(post));
    }

    clear() {
      this._posts = [];
    }

    constructor(posts = []) {
      this._posts = posts.filter((post) => api.validatePost(post));
    }
}

api._postSchema.description.required = true;

// Testing
const twitter = new api([
  {
    id: '1',
    description: 'Более 76 тыс. человек во всем мире уже излечились от заболевания, спровоцированного новым коронавирусом, тогда как количество смертей превысило 6,4 тыс.',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'Иванов Иван',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '2',
    description: 'test2',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test2',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '3',
    description: 'test3',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test3',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '4',
    description: 'test4',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test4',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [],
  },
  {
    id: '5',
    description: 'test5',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test5',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '6',
    description: 'test6',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test6',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '7',
    description: 'test7',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test7',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '8',
    description: 'test8',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test8',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '9',
    description: 'test9',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test9',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '10',
    description: 'test10',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test10',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '11',
    description: 'test11',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test11',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '12',
    description: 'test12',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test12',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '13',
    description: 'test13',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test13',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '14',
    description: 'test14',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test14',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
  {
    id: '15',
    description: 'test15',
    createdAt: new Date('2020-03-17T23:00:00'),
    author: 'test15',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
    likes: [
      'Иванов Иван',
    ],
  },
]);

console.log(twitter.addAll([
  {
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
  },
  {
    description: 'test18',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  },
  {
    description: 'test19',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  },
  {
    description: 'test20',
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  },
  {
    description: 10,
    photoLink: 'https://www.pressball.by/images/stories/2020/03/20200310231542.jpg',
    hashTags: [
      'coronavirus', 'virus',
    ],
  },
]));

console.log(twitter.getPosts(0, 10, { author: 'Иванов Иван', hashTags: ['coronavirus'] }));
console.log(twitter.getPosts(10, 5));
console.log(twitter.getPost('1'));
console.log(twitter.editPost('1', { description: 'edited description' }));
console.log(twitter.editPost('1', { a: 'aaa' }));
console.log(api.validatePost(twitter.getPost('1')));
console.log(api.validatePost({ description: 'test', likes: 'test' }));
console.log(twitter.removePost('50'));
console.log(twitter.removePost('3'));
console.log(twitter.getPosts());
const postWithoutPhoto = {
  description: 'Более 76 тыс. человек во всем мире уже излечились от заболевания, спровоцированного новым коронавирусом, тогда как количество смертей превысило 6,4 тыс.',
  hashTags: [
    'coronavirus', 'virus',
  ],
  likes: [
    'Иванов Иван',
  ],
};
console.log(twitter.addPost(postWithoutPhoto));
console.log(twitter.getPosts(0, 50));
