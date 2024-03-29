const each = require('lodash/each')
const Promise = require('bluebird')
const path = require('path')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const indexPage = path.resolve('./src/pages/index.js')
  createPage({
    path: `posts`,
    component: indexPage,
  })
  createPage({
    path: `projects`,
    component: indexPage,
  })

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    const blogProject = path.resolve('./src/templates/blog-project.js')
    
    resolve(
      graphql(
        `
          {
            allCosmicjsPosts(sort: { fields: [published_at], order: DESC }, limit: 1000) {
              edges {
                node {
                  slug,
                  title
                }
              }
            }
            allCosmicjsProjects(sort: { fields: [published_at], order: DESC }, limit: 1000) {
              edges {
                node {
                  slug,
                  title
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allCosmicjsPosts.edges;

        each(posts, (post, index) => {
          const next = index === posts.length - 1 ? null : posts[index + 1].node;
          const previous = index === 0 ? null : posts[index - 1].node;

          createPage({
            path: `posts/${post.node.slug}`,
            component: blogPost,
            context: {
              slug: post.node.slug,
              previous,
              next,
            },
          })
        })

        // Create projects pages.
        const projects = result.data.allCosmicjsProjects.edges;

        each(projects, (project, index) => {
          const next = index === projects.length - 1 ? null : projects[index + 1].node;
          const previous = index === 0 ? null : projects[index - 1].node;

          createPage({
            path: `projects/${project.node.slug}`,
            component: blogProject,
            context: {
              slug: project.node.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}
