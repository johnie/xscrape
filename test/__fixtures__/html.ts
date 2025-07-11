export const kitchenSink = `
<!DOCTYPE html>
<html>
<head>
  <meta name="description" content="An example description.">
  <meta name="keywords" content="typescript,html,parsing">
  <meta name="views" content="1234">
  <title>Example Title</title>
</head>
<body></body>
</html>
`;

export const kitchenSinkWithNested = `
<!DOCTYPE html>
<html>
<head>
  <title>Example Title</title>
  <meta property="og:image" content="https://example.se/images/c12ffe73-3227-4a4a-b8ad-a3003cdf1d70?h=708&amp;tight=false&amp;w=1372">
  <meta property="og:image:width" content="1372">
  <meta property="og:image:height" content="708">
</head>
<body></body>
</html>
`;

export const largeKitchenSink = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Kitchen Sink</title>

  <!-- Meta Tags -->
  <meta name="description" content="A comprehensive HTML kitchen sink example demonstrating a variety of HTML elements for testing and styling.">
  <meta name="keywords" content="HTML, kitchen sink, example, meta tags, og tags, JSON-LD">
  <meta name="author" content="Your Name">
  <meta name="robots" content="index, follow">

  <!-- Open Graph Tags -->
  <meta property="og:title" content="HTML Kitchen Sink Example">
  <meta property="og:description" content="This page demonstrates a wide variety of HTML elements for styling and functional testing purposes.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/kitchen-sink">
  <meta property="og:image" content="https://example.com/images/kitchen-sink.jpg">
  <meta property="og:site_name" content="HTML Kitchen Sink Demo">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HTML Kitchen Sink Example">
  <meta name="twitter:description" content="This page demonstrates a wide variety of HTML elements for styling and functional testing purposes.">
  <meta name="twitter:image" content="https://example.com/images/kitchen-sink.jpg">
  <meta name="twitter:site" content="@YourTwitterHandle">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "HTML Kitchen Sink Example",
      "description": "A comprehensive HTML kitchen sink example demonstrating a variety of HTML elements for testing and styling.",
      "url": "https://example.com/kitchen-sink",
      "image": "https://example.com/images/kitchen-sink.jpg",
      "publisher": {
        "@type": "Organization",
        "name": "Your Organization",
        "logo": {
          "@type": "ImageObject",
          "url": "https://example.com/logo.png"
        }
      },
      "author": {
        "@type": "Person",
        "name": "Your Name"
      }
    }
  </script>

  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #333;
    }
    code, pre {
      background: #f4f4f4;
      padding: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    table, th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>

  <h1>Kitchen Sink Example</h1>
  <p>This page demonstrates a wide variety of HTML elements for styling and functional testing purposes.</p>

  <h2>Headings</h2>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>

  <h2>Text Elements</h2>
  <p>This is a paragraph of text. <strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <del>deleted text</del> can be styled inline.</p>
  <p>Here’s an example of <a href="#">a link</a> and <a href="#" title="This is a tooltip">a link with a tooltip</a>.</p>

  <h2>Lists</h2>
  <h3>Unordered List</h3>
  <ul>
    <li>List item 1</li>
    <li>List item 2
      <ul>
        <li>Nested item 1</li>
        <li>Nested item 2</li>
      </ul>
    </li>
    <li>List item 3</li>
  </ul>

  <h3>Ordered List</h3>
  <ol>
    <li>Ordered item 1</li>
    <li>Ordered item 2</li>
    <li>Ordered item 3</li>
  </ol>

  <h3>Definition List</h3>
  <dl>
    <dt>HTML</dt>
    <dd>A markup language for creating web pages.</dd>
    <dt>CSS</dt>
    <dd>A style sheet language used to style HTML elements.</dd>
  </dl>

  <h2>Forms</h2>
  <form action="#" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
    <fieldset>
      <legend>Choose a Plan:</legend>
      <input type="radio" id="free" name="plan" value="free">
      <label for="free">Free</label><br>
      <input type="radio" id="pro" name="plan" value="pro">
      <label for="pro">Pro</label>
    </fieldset>
    <label for="feedback">Feedback:</label>
    <textarea id="feedback" name="feedback"></textarea>
    <button type="submit">Submit</button>
  </form>

  <h2>Tables</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Country</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>28</td>
        <td>USA</td>
      </tr>
      <tr>
        <td>Jane Doe</td>
        <td>26</td>
        <td>UK</td>
      </tr>
    </tbody>
  </table>

  <h2>Code</h2>
  <p>Inline code example: <code>&lt;div&gt;Hello&lt;/div&gt;</code></p>
  <pre>
    <code>
      &lt;html&gt;
        &lt;body&gt;
          &lt;p&gt;Hello World&lt;/p&gt;
        &lt;/body&gt;
      &lt;/html&gt;
    </code>
  </pre>

  <h2>Images</h2>
  <img src="https://via.placeholder.com/150" alt="Placeholder Image">
  <figure>
    <img src="https://via.placeholder.com/150" alt="Placeholder Image">
    <figcaption>A sample figure with caption.</figcaption>
  </figure>

  <h2>Embedded Video</h2>
  <video controls width="320">
    <source src="movie.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>

  <h2>Blockquotes</h2>
  <blockquote>
    "This is a blockquote example. Great for long quotes."
  </blockquote>

</body>
</html>
`;

export const kitchenSinkWithLinks = `
<!DOCTYPE html>
<html>
<head>
  <title>Kitchen Sink with Links</title>
  <meta name="description" content="A kitchen sink example with various HTML elements including links.">
</head>
<body>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">External Link</a>
<a href="#internal-link">Internal Link</a>
<a href="mailto:example@example.com">Email Us</a>
</body>
</html>
`;
