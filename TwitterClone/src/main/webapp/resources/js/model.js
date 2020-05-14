let currentAuthor = '';
let currentFilter = {};

class model {
  static _fillData(post = {}) {
    const localPost = { ...post };
    localPost.author = currentAuthor;
    localPost.createdAt = new Date(Date.now());
    localPost.hashTags = [];

    const tagRegex = /#(\w)+/g;
    const tags = localPost.description.match(tagRegex);
    tags?.forEach((tag) => {
      const tagStripped = tag.substr(1);
      if (localPost.hashTags.indexOf(tagStripped) === -1) {
        localPost.hashTags.push(tagStripped);
      }
    });
    return localPost;
  }

  static async getPosts(
    skip = 0, top = controller.postsOnSinglePage, filterConfig = {},
  ) {
    const reqFilter = { ...filterConfig };
    reqFilter.skip = skip;
    reqFilter.top = top;

    const response = await fetch('/tweets/search', {
      method: 'POST',
      body: JSON.stringify(reqFilter),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  static async getPost(id = 0) {
    const response = await fetch(`/tweets?id=${id}`);
    return response.json();
  }

  static async addPost(post = {}) {
    const localPost = model._fillData(post);

    const response = await fetch('/tweets', {
      method: 'POST',
      body: JSON.stringify(localPost),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  static async removePost(id = 0) {
    const response = await fetch(`/tweets?id=${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  static async editPost(id = 0, post = {}) {
    const localPost = model._fillData(post);

    const response = await fetch('/tweets', {
      method: 'PUT',
      body: JSON.stringify(localPost),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }

  static async addLike(id = 0, author = '') {
    const response = await fetch(`/tweets/like?id=${id}&author=${author}`, {
      method: 'POST',
    });

    return response.ok;
  }

  static async findUsername(username = '') {
    const response = await fetch(`/tweets/login?username=${username}`);
    return response.ok;
  }

  static async getAllAuthors() {
    const response = await fetch('/tweets/authors');
    return response.json();
  }

  static async getAllTags() {
    const response = await fetch('/tweets/tags');
    return response.json();
  }

  static async uploadImage(event) {
    if (event.target.elements.file.value.length === 0) {
      throw new Error('No file found');
    }

    const formData = new FormData();
    formData.append('file', event.target.elements.file.files[0]);

    const response = await fetch('/image', {
      method: 'POST',
      body: formData,
    });

    return response.text();
  }
}
