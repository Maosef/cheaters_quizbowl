import React from 'react';

class Component_template extends React.Component {
    constructor(props) {
      super(props);
      this.state = {isToggled: false};
  
      this.handleClick = this.handleClick.bind(this);
    }
    
    componentDidMount() {
        this.$el = $(this.el);
    
        window.addEventListener("keydown", this.captureSearch);
        this.display();
      }
    
    // when query or document changes, update terms in keyword search box, trigger search
    componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
        // console.log("new props", this.props);
        if (prevProps.searchTerms !== this.props.searchTerms) {
        this.setState({ searchTerms: this.props.searchTerms });
        }
        
        // this.search(this.props.searchTerms);
        $("input[type='search']").val(this.props.searchTerms).trigger("input");
    }
    }

    componentWillUnmount() {
    // this.$el.off('change', this.handleInputChange);
    window.removeEventListener('keydown', this.captureSearch);
    }

    handleClick() {
        this.props.onClick();
    }

    render() {

    //   return <Button variant="contained" color="secondary" onClick={this.handleClick}>
    //      {this.props.text}
    //          </Button>;
    }
  }


export default Component_template;