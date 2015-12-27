import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { loadRepo, loadStargazers } from 'actions/api';

import Repo from 'components/Repo';
import User from 'components/User';
import List from 'components/List';


function mapStateToProps(state) {
  const { login, name } = state.router.params;
  const {
    pagination: { stargazersByRepo },
    entities: { users, repos }
  } = state;

  const fullName = `${login}/${name}`;
  const stargazersPagination = stargazersByRepo[fullName] || { ids: [] };
  const stargazers = stargazersPagination.ids.map(id => users[id]);

  return {
    fullName,
    name,
    stargazers,
    stargazersPagination,
    repo: repos[fullName],
    owner: users[login]
  };
}

class RepoPage extends Component {
  static propTypes = {
    repo: PropTypes.object,
    fullName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    owner: PropTypes.object,
    stargazers: PropTypes.array.isRequired,
    stargazersPagination: PropTypes.object,
    loadRepo: PropTypes.func.isRequired,
    loadStargazers: PropTypes.func.isRequired
  };

  static loadDataDeferred(getState, dispatch) {
    const { fullName } = mapStateToProps(getState());

    dispatch(loadRepo(fullName, [ 'description' ]));
    dispatch(loadStargazers(fullName));
  }

  constructor(props) {
    super(props);
    this.renderUser = this.renderUser.bind(this);
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }


  componentWillMount() {
    RepoPage.loadData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      RepoPage.loadData();
    }
  }

  handleLoadMoreClick() {
    this.props.loadStargazers(this.props.fullName, true);
  }

  renderUser(user) {
    return (
      <User user={user}
            key={user.login} />
    );
  }

  render() {
    const { repo, owner, name } = this.props;

    if (!repo || !owner) {
      return <h1><i>Loading {name} details...</i></h1>;
    }

    const { stargazers, stargazersPagination } = this.props;

    return (
      <div>
        <Repo repo={repo}
                    owner={owner} />
        <hr />
        <List renderItem={this.renderUser}
              items={stargazers}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading stargazers of ${name}...`}
              {...stargazersPagination} />
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  loadRepo,
  loadStargazers
})(RepoPage);
