
    const searchuser={
        input:null,
        dropdown:null,
        debounceTimer:null,
        selectedIndex:-1,
        result:[],

        init(){
            this.input=document.querySelector('#request_user');
            this.dropdown=document.querySelector('.dropdown');
            this.bindEvents();
            console.log(this)
        },
        bindEvents(){
            this.input.addEventListener('input',(e)=>{
                clearTimeout(this.debounceTimer);
                const query=e.target.value.trim();
                if (query.length<2){
                    this.hideDropdown();
                    return
                }
                this.debounceTimer=setTimeout(()=>{
                    this.search(query);
                },1000)
            });
            // Keyboard navigation
            this.input.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.moveSelection(1);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.moveSelection(-1);
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.selectResult();
                        break;
                    case 'Escape':
                        this.hideDropdown();
                        break;
                }
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                    this.hideDropdown();
                }
            });
        },

        async search(query) {
            this.showLoading();
            
            try {
                // Replace with your API endpoint
                const response = await fetch(`/case/getuser_info?search=${query}`);
                
                // For demonstration, using dummy data
                this.results = [
                    { id: 1, name: `Result 1 for ${query}` },
                    { id: 2, name: `Result 2 for ${query}` },
                    { id: 3, name: `Result 3 for ${query}` }
                ];

                this.displayResults(query);
            } catch (error) {
                console.error('Search error:', error);
                this.showError();
            }
        },

        displayResults(query) {
            if (this.results.length === 0) {
                this.dropdown.innerHTML = '<div class="no-results">No results found</div>';
                this.showDropdown();
                return;
            }

            const html = this.results.map((result, index) => {
                const highlightedName = this.highlightMatch(result.name, query);
                return `
                    <div class="dropdown-item" data-index="${index}">
                        ${highlightedName}
                    </div>
                `;
            }).join('');

            this.dropdown.innerHTML = html;
            this.showDropdown();

            // Add click events to items
            this.dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.selectedIndex = index;
                    this.selectResult();
                });

                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = parseInt(item.dataset.index);
                    this.highlightSelected();
                });
            });
        },

        highlightMatch(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        },

        moveSelection(direction) {
            if (!this.dropdown.classList.contains('show')) return;

            this.selectedIndex += direction;

            if (this.selectedIndex >= this.results.length) {
                this.selectedIndex = 0;
            } else if (this.selectedIndex < 0) {
                this.selectedIndex = this.results.length - 1;
            }

            this.highlightSelected();
            this.scrollToSelected();
        },

        highlightSelected() {
            this.dropdown.querySelectorAll('.dropdown-item').forEach((item, index) => {
                item.classList.toggle('selected', index === this.selectedIndex);
            });
        },

        scrollToSelected() {
            const selected = this.dropdown.querySelector('.selected');
            if (selected) {
                selected.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        },

        selectResult() {
            if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
                const selected = this.results[this.selectedIndex];
                this.input.value = selected.name;
                this.hideDropdown();
                // Trigger any additional actions here
            }
        },

        showLoading() {
            this.dropdown.innerHTML = '<div class="loading">Searching...</div>';
            this.showDropdown();
        },

        showError() {
            this.dropdown.innerHTML = '<div class="no-results">Error fetching results</div>';
            this.showDropdown();
        },

        showDropdown() {
            this.dropdown.classList.add('show');
        },

        hideDropdown() {
            this.dropdown.classList.remove('show');
            this.selectedIndex = -1;
        }
    };

    // Initialize the search field
    searchuser.init();