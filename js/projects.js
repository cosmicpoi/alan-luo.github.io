let projectLinks = document.getElementsByClassName("project-link");
let tagLinks = document.getElementsByClassName("tag-link");

let addClass = (link, tag) => {
	if(!link.classList.contains(tag)) link.classList.add(tag);
};
let remClass = (link, tag) => {
	if(link.classList.contains(tag)) link.classList.remove(tag);
};

function applyFilter(filter) {
	for(let i=0; i<projectLinks.length; i++) { 
		let link = projectLinks[i];
		let tags = link.getAttribute('data-tags').split(" ");

		if(tags.includes(filter) || filter == "everything")
			remClass(link, "hidden");
		else addClass(link, "hidden");
	}

	for(let i=0; i<tagLinks.length; i++) { 
		let link = tagLinks[i];

		if(link.text==filter) addClass(link, "bold");
		else remClass(link, "bold");
	}
}

let thumbs = document.getElementsByClassName("thumb-image");
let animLinks = document.getElementsByClassName("anim-link");
function getHover(hoverId) {
	return function() {
		let id = hoverId;

		for(let i=0; i<thumbs.length; i++) {
			let thumb = thumbs[i];
			let projectId = thumb.getAttribute('data-project-id');

			if(projectId == id) remClass(thumb, "hide-image");
			else addClass(thumb, "hide-image");
		}
	}
}
for(let i=0; i<animLinks.length; i++) {
	let link = animLinks[i];
	let id = link.getAttribute('data-project-id');
	let myHover = getHover(id);
	link.addEventListener("mouseover", myHover);
}