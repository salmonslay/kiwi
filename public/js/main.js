window.onload = function () {
    // set active page
    if (window.location.hash === "")
        setPage("projects");
    else
        setPage(window.location.hash.substring(1));


    $('.popup').click(function (event) {
        if ($(event.target).closest('.popup-content').length === 0) {
            closePopup();
        }
    });

    // Wait for the projects to be loaded (data)
    let projectAttempts = 0;
    const projectReadyListener = () => {
        if (typeof data !== 'undefined') {
            return loadProjects();
        } else {
            projectAttempts++;
        }
        return setTimeout(projectReadyListener, projectAttempts < 200 ? 25 : 250);
    };
    projectReadyListener();
    let blogAttempts = 0;
    const blogReadyListener = () => {
        if (typeof blogData !== 'undefined') {
            return loadBlogs();
        } else {
            blogAttempts++;
        }
        return setTimeout(blogReadyListener, blogAttempts < 200 ? 25 : 250);
    };
    blogReadyListener();
};

/**
 * Sets the active page to the given page.
 * @param page The page to set as active.
 */
function setPage(page) {
    let p = document.getElementById("page-" + page);
    let b = document.getElementById("button-" + page);

    // verify that the page exists
    if (p === null || b === null)
        return;

    // show page
    p.classList.remove("d-none");
    b.classList.add("active");

    if (page !== "projects")
        history.replaceState(undefined, undefined, "#" + page);
    else
        history.replaceState(undefined, undefined, window.location.pathname);

    // hide other pages
    let pages = document.getElementsByClassName("page");
    for (let i = 0; i < pages.length; i++) {
        if (pages[i] !== p)
            pages[i].classList.add("d-none");
    }

    // remove active from other buttons
    let buttons = document.getElementsByClassName("nav-button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== b)
            buttons[i].classList.remove("active");
    }
}

const buttonIcons = {
    "github": "fab fa-github",
    "unity": "fab fa-unity",
    "documentation": "fas fa-book",
    "video": "fas fa-video",
    "leaderboard": "fa-solid fa-medal",
    "trailer": "fa-solid fa-film",
    "album": "fa-solid fa-images",
    "steam": "fa-brands fa-steam",
    "google play": "fa-brands fa-google-play",
    "blog": "fa-solid fa-feather-pointed",
    "itch.io": "fa-brands fa-itch-io",
    "view": "fas fa-globe",
    "download": "fa-solid fa-download",
}

const projects = {};

function loadProjects() {
    data.forEach(project => {
        if (project.hidden)
            return;

        // create pills
        let pillHtml = "";
        for (let key in project.tags) {
            project.tags[key].forEach(tag => {
                pillHtml += `<span class="pill color-${key}">${tag}</span>`;
            });
        }

        // create buttons
        let buttonHtml = "";
        project.links.forEach(link => {
            let hasIcon = link.icon !== undefined;
            // find icon whose name exists in the link title
            let icon = hasIcon ? link.icon : "fa-solid fa-link";
            if (!hasIcon) {
                for (let key in buttonIcons) {
                    if (link.title.toLowerCase().includes(key)) {
                        icon = buttonIcons[key];
                        break;
                    }
                }
            }
            buttonHtml += `<a class="button" href="${link.url}" target="_blank"><i class="${icon}"></i> ${link.title}</a>`;
        });

        // a project id is the project title with all non-alphanumeric characters removed and spaces replaced with dashes
        let projectId = project.title.replace(/ /g, "-")
            .replace(/[^a-zA-Z0-9\-]/g, "")
            .toLowerCase();

        // add thumbnail to image list and add an index
        project.index = 0;
        if (!project.images)
            project.images = [];
        project.images.unshift(project.thumbnail);

        let projectHtml =
            `
                    <li id="project-${projectId}">
                        <figure>
                            <div class="thumbnail-container">
                                <img class="thumbnail" src="${project.thumbnail}" alt="${project.title}">
                                
                                <!-- add arrows & dots if there is more than one image -->
                                ${project.images && project.images.length > 1 ? `
                                    <i class="fa-solid fa-chevron-left fa-xl arrow left-arrow" onclick="changeImage(true, '${projectId}');"></i>
                                    <i class="fa-solid fa-chevron-right fa-xl arrow right-arrow" onclick="changeImage(false, '${projectId}');"></i>
                                    
                                    <!-- add dots to make image switching easier -->
                                    <div class="dots">
                                        ${project.images.map((image, index) => `
                                        <span class="dot" onclick="changeImageTo(${index}, '${projectId}');"></span>`).join("")}</div>` : ``}
                            </div>
                            
                            <figcaption>
                                <h3>
                                    ${project.starred ? `<!--<i title="Large / important project" class="fas fa-star"></i>-->` : ``} 
                                    ${project.school ? `<!-- <i title="Project made for or in school" class="fa-solid fa-graduation-cap"></i>-->` : ``}
                                    ${project.title} 
                                </h3> 
                                <p class="short-description">${mdLinksToHtml(project.description)}</p>
                                <p class="long-description">${mdLinksToHtml(project.longDescription ? project.longDescription : project.description)}</p>
                                <div class="toolbar">
                                    <div class="pills">
                                        ${pillHtml}
                                    </div>
                                    <div class="buttons">
                                        ${buttonHtml}
                                        ${project.markdown ? `<a class="popup-button button" onclick="openPopup('project-${projectId}');">Read more...</a>` : ``}
                                    </div>
                                </div>
                            </figcaption>
                        </figure>
                    </li>
                    `

        // strip away html-comments
        projectHtml = projectHtml.replace(/<!--[\s\S]*?-->/g, "");

        // add active to the first dot
        projectHtml = projectHtml.replace(/class="dot"/, "class=\"dot active\"");

        document.getElementById("project-gallery").innerHTML += projectHtml;

        projects[projectId] = project;
    });
    document.getElementById("loading").remove();
}

function loadBlogs() {
    blogData.posts.forEach(blog => {

        let pillHtml = "";
        blog.metadata.tags.forEach(tag => {
            pillHtml += `<span class="pill color-framework">${tag}</span>`;
        });

        let blogHtml =
            `
                    <li class="blog-gallery-entry" id="project-${blog.slug}" style="max-width: 1000px!important;">
                        <a href="/blog/${blog.slug}">
                            <figure>
                                <div class="thumbnail-container">
                                    <img class="thumbnail" src="${blog.metadata.thumbnail}" alt="${blog.metadata.title}">
                                </div>
                                <figcaption>
                                    <h3>
                                        ${blog.metadata.title} 
                                    </h3> 
                                    <p class="short-description">${blog.metadata.summary}</p>
                                    <p class="long-description">${blog.metadata.summary}</p>
                                    <div class="toolbar">
                                    <div class="pills">
                                        ${pillHtml}
                                    </div>
    <!--                                    <div class="buttons">
                                            <a class="button" href="/" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i>Read</a>
                                        </div>-->
                                    </div>
                                </figcaption>
                            </figure>
                        </a>
                    </li>
                    `

        document.getElementById("blog-gallery").innerHTML += blogHtml;
    });
    document.getElementById("loading").remove();

}

function mdLinksToHtml(md) {
    md = md.replace(/\[(.*?)\]\((.*?)\)/g, "<a href=\"$2\">$1</a>");

    return md;
}

/**
 * Changes the currently displayed image of a project
 * @param left Whether to go left or right
 * @param projectId The id of the project
 */
function changeImage(left, projectId) {
    let project = projects[projectId];

    console.log(`going ${left ? "left" : "right"} on project ${projectId}`);

    project.index += left ? -1 : 1;
    if (project.index < 0)
        project.index = project.images.length - 1;
    else if (project.index >= project.images.length)
        project.index = 0;

    $(`#project-${projectId} .thumbnail`).attr("src", project.images[project.index]);

    // update active dot
    $(`#project-${projectId} .dot`).removeClass("active");
    $(`#project-${projectId} .dot:nth-child(${project.index + 1})`).addClass("active");
}

function changeImageTo(index, projectId) {
    let project = projects[projectId];

    console.log(`going to image ${index} on project ${projectId}`);

    project.index = index;

    $(`#project-${projectId} .thumbnail`).attr("src", project.images[project.index]);

    // update active dot
    $(`#project-${projectId} .dot`).removeClass("active");
    $(`#project-${projectId} .dot:nth-child(${project.index + 1})`).addClass("active");
}

function openPopup(id) {
    console.log(`opening popup ${id}`);
    $(".popup").addClass('active');


    // parse project markdown and add to popup
    let project = projects[id.replace("project-", "")];
    let div = $("#popup-content-html");
    div.html("Loading project...");

    // load markdown file (project.markdown)
    $.get(project.markdown, function (data) {
        data = data.replace(/---[\s\S]*?---/, ""); // (metadata)

        div.html(marked.parse(data));
        hljs.highlightAll();
    }).fail(function (error) {
        div.html(`Something went wrong while loading the project description. That's awkward. <br> Error: ${error.statusText}`);
    });
}

function closePopup() {
    $(".popup").removeClass('active');
}