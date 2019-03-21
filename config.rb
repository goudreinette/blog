# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions
require 'stamp'

#activate :livereload
#activate :autoprefixer do |prefix|
 # prefix.browsers = "last 2 versions"
#end


# Markdown
set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

# Code highlighting
activate :syntax

activate :blog do |blog|
  # set options on blog
   blog.sources = "articles/{year}-{month}-{day}-{title}.html"
   blog.permalink = "thoughts/{year}/{month}/{day}/{title}"
   blog.layout = 'article'
end


# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
page 'bio/*.html', layout: 'bio'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

helpers do
  def link_active(label, link)
    "<a href='#{link}' class='#{'active' if "/#{current_page.path}" == link}'>#{label}</a>"
  end

  def next_article
    blog.articles.reverse.find { |a| a.date > current_article.date }
  end

  def prev_article
    blog.articles.find { |a| a.date < current_article.date }
  end

  def img_glob(folder)
    Dir.glob("./source/images/#{folder}/*.jpg").sort.map do |path|
        linked_img("/images/#{folder}/#{File.basename(path)}")
    end.join
  end

  def linked_img(path)
    "<img src='#{path}'/>"
  end
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

# configure :build do
#   activate :minify_css
#   activate :minify_javascript
# end
