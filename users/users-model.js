const db = require('../data/dbConfig');
const percentile = require("percentile");

module.exports = {
    find,
    add,
    findBy,
    login,
    remove
}


function findSixtiethP(arr){
    arr = arr.sort(function(a, b){return a-b})
    let x = arr.length
    let y = ((x+1)*.6)
    if(y%1 === 0){
      return arr[y-1]
    }else{
      let ySplit = y.toString().split(".")
      let II = parseFloat(ySplit[0])
      let dd = parseFloat("." + ySplit[1])
      let z = arr[II + 1] - arr[II]
      return II + (z*dd)
    }
  }

  function findIndexOfClosestNum(num, arr){
    let difference = 10000
    let index = 0
    for (let i = 0; i < arr.length ; i++){
      if(Math.abs(arr[i] - num) < difference){
        difference = Math.abs(arr[i] - num);
        index = i
      }
    }
    return index
  }


// users
// reviews
// strains

function find(){
    return db('users')  // === select * from users
}


// {
//     username: string, required, unique
//     password: string, required
//     email: string, required, unique
//     name: string, required
// }


function add(userInfo){
    return db('users').insert(userInfo)
}

function findBy(field, fieldValue){
    return db('users')
        .where({ [field]: fieldValue })
        .first()
}

function login(field, fieldValue){
    return db('users')
        .where({ [field]: fieldValue })
        .first()
        .then((user) => {
            let reviewedStrains = []
            return db('reviews')
                .where({user_id: parseFloat(user.id)})
                .then((reviews) => {
                    reviews.map(review => {
                        return db('strains')
                            .where({id: review.strain_id})
                            .first()
                            .then((strain) => {
                                strains.push(strain)
                            })
                    })
                    //once testing for goals, run if else based on if questionnare answered
                    return db('strains')
                        .orderBy("strain_creative", "asc")
                        .then((strains) => {
                            let strainsWithIsolatedGoal = [];
                            strains.map((strain) => {
                                strainsWithIsolatedGoal.push(strain.strain_creative) //< have someone rename strain_[goal] with just the goal name and replace with [goal]
                            }) //<< Add strain goal ranks to an array
                            let sixtiethP = percentile(80, strainsWithIsolatedGoal)
                            let indexOfSixtieth = findIndexOfClosestNum(sixtiethP, strainsWithIsolatedGoal)
                            let sixtiethPercentile = strains[indexOfSixtieth]
                            return {
                                user: user,
                                reviews: reviews,
                                reviewedStrains: reviewedStrains,
                                recommendations: [
                                    strains[indexOfSixtieth],
                                    strains[indexOfSixtieth + 1],
                                    strains[indexOfSixtieth + 2],
                                    strains[indexOfSixtieth + 3],
                                    strains[indexOfSixtieth + 4],
                                    strains[indexOfSixtieth + 5]
                                ]
                            }

                        })
                })
        })
}

// function login(field, fieldValue){
//     return db('users')
//         .where({ [field]: fieldValue })
//         .first()
//         .then((user) => {
//             let reviewedStrains = []
//             return db('reviews')
//                 .where({user_id: parseFloat(user.id)})
//                 .then((reviews) => {
//                     reviews.map(review => {
//                         return db('strains')
//                             .where({id: review.strain_id})
//                             .first()
//                             .then((strain) => {
//                                 strains.push(strain)
//                             })
//                     })
//                     return {
//                         user: user,
//                         reviews: reviews,
//                         reviewedStrains: reviewedStrains,
//                     }
//                 })
//         })
// }


function remove(id){
    return findBy("id", id)
        .then((user) => {
            console.log(user)
            if (user) {
                return db('users')
                    .where({ id: id })
                    .del()
                    .then(() => {
                        return user
                    })
            } else {
                return null
            }
        })
    
}