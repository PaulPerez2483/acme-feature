    const { Component } = React;
    const { render } = ReactDOM;
    const { Switch, Link, Route, HashRouter, Redirect } = ReactRouterDOM;
    const root = document.querySelector('#root');

    const Nav = ({ companies, path })=> {
        const grouped = companies.reduce((obj, company) => {
            const letter = company.name.slice(0,1);
            if(!obj[letter]) {
                obj[letter] = [];
            }
            obj[letter].push(company);
            return obj;
        }, {});
        console.log(grouped);
        let letter ='';
            if(Object.keys(grouped).length > 0) {
                letter = Object.keys(grouped).sort()[0];
            }
      const links = [
        { to: '/', text: 'Acme Company Profits with React Router', selected: path === '/' },
        { to: `/companies/${letter}`, text: `Companies (${ companies.length })`, selected: path.startsWith('/companies')},
      ];
      return (
        <nav>
          {
            links.map( (link, idx) => <Link key={ idx } to={ link.to } className={ link.selected ? 'selected': ''}>{ link.text }</Link>)
          }
        </nav>
      );
    };

    const Testing = () => {
        return(
            <h1>hi</h1>
        )
    }

    const Companies = (props)=> {
    //   console.log(props);
      const { companies, location, match } = props;
      const letter = match.params.letter;
        console.log(letter)
      const grouped = companies.reduce((obj, company) => {
          const letter = company.name.slice(0,1);
          if(!obj[letter]) {
              obj[letter] = [];
          }
          obj[letter].push(company);
          return obj;
      }, {});
      console.log(grouped);
      return(
          <div>
            <nav>
                {
                    Object.keys(grouped)
                    .sort()
                    .map(key => <Link key={key} to={`/companies/${key}`} className={letter === key ? 'selected' : null}>{key}</Link>)
                }
            </nav>
                {
                    // this needs to be an expression
                    // console.log(letter, grouped[letter])
                    
                    letter && grouped[letter] && (
                        <ul>
                            {
                            grouped[letter].map( company =>{
                            return( <li key={ company.id }>
                                    <Link to={`/companies/${letter}/${ company.id }`}
                                          className={ location.pathname === `/companies/${letter}/${company.id}` ? 'selected' : ''}>
                                          { company.name }</Link>
                                    </li>
                                    )
                                        })

                            }
                        </ul>
                    )
                }

        <Route path='/companies/:letter/:id' component={ Company } />
        {/* <Route path='/companies/:letter/id' component={Testing} /> */}

        </div>
      );
    };

    class Company extends Component{
      constructor(){
        super();
        this.state = {
          companyProfits: [] 
        };
      }
      async componentDidMount(){
        const id = this.props.match.params.id;
        const response = await axios.get(`https://acme-users-api-rev.herokuapp.com/api/companies/${id}/companyProfits`)
        this.setState({ companyProfits: response.data });

      }
      async componentDidUpdate(prevProps){
        const id = this.props.match.params.id;
        if(id === prevProps.match.params.id){
          return;
        }
        const response = await axios.get(`https://acme-users-api-rev.herokuapp.com/api/companies/${id}/companyProfits`)
        this.setState({ companyProfits: response.data });

      }
      render(){
        const { companyProfits } = this.state;
        return (
          <ul>
            {
              companyProfits.map( companyProfit => <li className='companyItem' key={ companyProfit.id}>
                <div className='year'>
                  { moment(companyProfit.fiscalYear).format('YYYY') }
                </div>
                ${ companyProfit.amount } 
              </li>)
            }
          </ul>
        );
      }
    }


    const Home = ()=> {
      return <div id='home'>Welcome!!</div>;
    };

    class App extends Component{
      constructor(){
        super();
        this.state = {
          companies: [], 
          loading: true
        };
      }
      async componentDidMount(){
        const response = (await axios.get('https://acme-users-api-rev.herokuapp.com/api/companies')).data
        this.setState({ 
            companies: response,
            loading: false
         });
      }
      render(){
        const { companies, loading } = this.state;
        if(loading) return <p>fetching data</p>
        return (
          <HashRouter>
            <Route render={({ location })=> <Nav path={ location.pathname } companies={ companies } />} />
            <Switch>
              <Route exact path='/' component={ Home } />
              <Route path='/companies/:letter?' render={ (props)=> <Companies {...props} companies={ companies } /> } />
            </Switch>
          </HashRouter>
        );
      }
    }

    render(<App />, root);