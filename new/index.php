<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <?php wp_head(); ?>
    <link rel="stylesheet" href="/wp-content/themes/rein.computer/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rein van der Woerd</title>
</head>

<body <?php body_class(); ?>>
    <section class="intro">
        <div class="inner">
            <div class="text">
                <b>Interaction designer — developer.</b> <br>
                Currently studying at <a href="https://www.instagram.com/designartandtechnologyarnhem/" target="_blank">IDA</a> and
                working on projects as part of <a href="https://vdwoerd.com" target="_blank">vdwoerd</a>.
            </div>
            <div class="contact">
                <a href="tel:0624175977">0624175977</a>
                <span class="sep">—</span>
                <a href="mailto:reinvanderwoerd@me.com">REINVANDERWOERD@ME.COM</a>
            </div>
        </div>
    </section>

    <section class="portfolio">
        <h2>Projects</h2>
        <div class="grid"></div>
    </section>

    <section class="catalog">
        <h2>
            Catalog
            <input type="text" id="filter" placeholder="filter...">
        </h2>
        <div class="grid">
            <?php foreach (get_posts(['post_type' => 'project', 'posts_per_page' => -1,  'orderby' => 'title', 'order'   => 'ASC',]) as $project): ?>
                <a class="project"><?= $project->post_title ?></a>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="blog">
        <h2>Blog</h2>
    </section>

    <footer></footer>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.10.2/p5.min.js"></script>
    <script src="/wp-content/themes/rein.computer/main.js"></script>

    <?php wp_footer(); ?>

    </body>
</html>
