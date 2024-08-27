# Kiwi

This is a rework of my personal landing page for my projects and other stuff (earlier [salmonslay/landing](https://github.com/salmonslay/landing)). It follows a portfolio / CV style and is built with [Node.js](https://nodejs.org/en), [Express.js](https://expressjs.com/), [EJS](https://ejs.co/), [SASS](https://sass-lang.com/) and the [Font Awesome](https://fontawesome.com/) icon font.

This page is not live yet, but the old one can be found [here](https://sofia.kiwi/).

## License / Using the template

MIT. Feel free to use the template for your own landing page. Just fork the repository and change the content to your needs.

### JSON structure

The projects on the page are stored in the `public/projects.json` file. The structure is as follows:

```json
{
  "title": "svb!catch",
  "description": "Web game based on osu!. Contains 200+ full beatmaps with music, 8 mods, online profiles and a custom difficulty system.",
  "longDescription": "An even longer description not shown in the README to save some space.",
  "thumbnail": "img/svb!catch.png",
  "images": [
    "img/svb!catch-0.webp",
    "img/svb!catch-1.webp"
  ],
  "starred": true,
  "school": false,
  "tags": {
    "engine": [
      "Node.js"
    ],
    "language": [
      "JavaScript"
    ],
    "framework": [
      "Express",
      "MySQL"
    ]
  },
  "links": [
    {
      "title": "View",
      "url": "https://svb.sajber.me/catch"
    },
    {
      "title": "GitHub",
      "url": "https://github.com/salmon/SVB"
    }
  ]
}
```

| Key             | Value    | Description                                                                                       | Required |
|-----------------|----------|---------------------------------------------------------------------------------------------------|----------|
| title           | string   | The title for the project                                                                         | x        |
| description     | string   | A short description for the project. Only displayed on mobile. Supports markdown                  | x        |
| longDescription | string   | A long description for the project. Only displayed on desktop. Supports markdown                  | x        |
| thumbnail       | string   | The path to the thumbnail image. It should be in roughly a **8:5 aspect ratio** or **600x380px**. | x        |
| images          | string[] | An array with additional image paths that the user can scroll between.                            |          |
| hidden          | boolean  | If true, the project will not be displayed in the list by default.                                |          |
| starred         | boolean  | Whether to show a star icon on the card                                                           |          |
| school          | boolean  | Whether to show a school icon on the card                                                         |          |
| tags            | object   | An object containing the tags for the project. See [below](#tags) for more information.           | x        |
| links           | object[] | A list of links for the project. See [below](#links) for more information.                        | x        |
| markdown        | string   | A path to a markdown file. Projects with this will get a "Read more" button to the markdown.      |          |

#### Tags

The tags are used to add badges to all projects by category. The following categories are available:

| Key       | Value    | Description                                | Required |
|-----------|----------|--------------------------------------------|----------|
| engine    | string[] | Tags that will be displayed in light blue. |          |
| language  | string[] | Tags that will be displayed in purple.     |          |
| framework | string[] | Tags that will be displayed in blue.       |          |

#### Links

The links are shown as buttons on the project card. A link object only has two keys:

| Key   | Value  | Description                                                                          | Required |
|-------|--------|--------------------------------------------------------------------------------------|----------|
| title | string | The text to display on the button                                                    | x        |
| url   | string | The URL to open when pressing the button                                             | x        |
| icon  | string | An optional FontAwesome icon class that will replace the icon generated from `title` |          |

All links have their own icon, which is determined by the title. If a title contains one of the following words, the corresponding icon will be used. If no icon is found, the default chain icon will be used. 

`github, view, unity, documentation, video, leaderboard, trailer, album, steam, download, google play, blog`

### Blogs

WIP