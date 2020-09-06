var VideoRequest = require('./../models/video-requests.model');

module.exports = {
  createRequest: (vidRequestData) => {
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (filterBy) => {
    const filter = filterBy === 'all' || !filterBy ? {} : {status: filterBy};
    return VideoRequest.find(filter).sort({ submit_date: '-1' });
  },

  searchRequests: (topic, filterBy) => {
    const filter = { topic_title: {$regex: topic, $options: 'i'} }
    if (filterBy && filterBy !== 'all') {
      filter.status = filterBy;
    }
    return VideoRequest.find(filter).sort({ submit_date: '-1' });
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, { new: true });
  },

  updateVoteForRequest: async (id, vote_type, user_id) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === 'ups' ? 'downs' : 'ups';

    let oldVotes = oldRequest.votes[vote_type];
    let otherOldVotes = oldRequest.votes[other_type];

    if (!oldVotes.includes(user_id)) {
      oldVotes.push(user_id);
    } else {
      oldVotes = oldVotes.filter(val => val !== user_id);
    }

    if (otherOldVotes.includes(user_id)) {
      otherOldVotes = otherOldVotes.filter(val => val !== user_id);
    }
  
    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: oldVotes,
          [other_type]: otherOldVotes,
        },
      },
      {new: true}
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
