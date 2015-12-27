import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import zip from 'lodash/array/zip';

import { loadUser, loadStarred } from 'actions/api';

import User from 'components/User';
import Repo from 'components/Repo';
import List from 'components/List';


export class UserPage extends Component {
  static propTypes = {
    login: PropTypes.string.isRequired,
    user: PropTypes.object,
    starredPagination: PropTypes.object,
    starredRepos: PropTypes.array.isRequired,
    starredRepoOwners: PropTypes.array.isRequired,
    loadUser: PropTypes.func.isRequired,
    loadStarred: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props)
    this.renderRepo = this.renderRepo.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  loadData() {
    const { login } = this.props;
    this.props.loadUser(login, [ 'name' ]);
    this.props.loadStarred(login);
  }

  componentWillMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login !== this.props.login) {
      this.loadData();
    }
  }

  handleLoadMoreClick() {
    this.props.loadStarred(this.props.login, true);
  }

  renderRepo([ repo, owner ]) {
    return (
      <Repo repo={repo}
            owner={owner}
            key={repo.fullName} />
    );
  }

  render() {
    const { user, login } = this.props;

    if (!user) {
      return <h1><i>Loading {login}’s profile...</i></h1>;
    }

    const { starredRepos, starredRepoOwners, starredPagination } = this.props;
    return (
      <div>
        <User user={user} />
        <hr />
        <List renderItem={this.renderRepo}
              items={zip(starredRepos, starredRepoOwners)}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading ${login}’s starred...`}
              {...starredPagination} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  const { login } = state.router.params;
  const {
    pagination: { starredByUser },
    entities: { users, repos }
  } = state;

  const starredPagination = starredByUser[login] || { ids: [] };
  const starredRepos = starredPagination.ids.map(id => repos[id]);
  const starredRepoOwners = starredRepos.map(repo => users[repo.owner]);

  return {
    login,
    starredRepos,
    starredRepoOwners,
    starredPagination,
    user: users[login]
  };
}

export default connect(mapStateToProps, {
  loadUser,
  loadStarred
})(UserPage);
