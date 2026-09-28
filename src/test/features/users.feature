Feature: Users API
  As a test automation engineer
  I want to verify the users API
  So that consumers receive reliable responses

  @smoke
  Scenario: Retrieve the user list with pagination
    When I request page 1 with a limit of 1
    Then the response status should be 200
    And the response should contain 1 user
    And the pagination headers should show page 1 and limit 1

  @smoke
  Scenario: Retrieve an existing user
    When I request user 1
    Then the response status should be 200
    And the user response should contain:
      | name         | gender | email            | status |
      | Ada Lovelace | female | ada@example.test | active |

  Scenario: Retrieve a user that does not exist
    When I request user 999
    Then the response status should be 404
    And the error message should be "Resource not found"

  @smoke
  Scenario: Create and delete a user
    When I create an authorized user with:
      | name         | gender | email                     | status |
      | Grace Hopper | female | grace.hopper@example.test | active |
    Then the response status should be 201
    And the user response should contain:
      | name         | gender | email                     | status |
      | Grace Hopper | female | grace.hopper@example.test | active |
    When I delete the created user
    Then the response status should be 204
    When I request the created user
    Then the response status should be 404

  Scenario: Reject a create request without valid authorization
    When I create an unauthorized user with:
      | name        | gender | email                    | status |
      | Test Person | male   | test.person@example.test | active |
    Then the response status should be 401
    And the error message should be "Invalid token"

  Scenario Outline: Validate required fields when creating a user
    When I create an authorized user with:
      | name   | gender   | email   | status   |
      | <name> | <gender> | <email> | <status> |
    Then the response status should be 422
    And the validation error for "<field>" should be "can't be blank"

    Examples:
      | name        | gender | email                    | status   | field  |
      |             | female | test.person@example.test | active   | name   |
      | Test Person |        | test.person@example.test | active   | gender |
      | Test Person | male   |                          | active   | email  |
      | Test Person | male   | test.person@example.test |          | status |

  Scenario: Reject an invalid email address
    When I create an authorized user with:
      | name        | gender | email        | status |
      | Test Person | male   | invalid-mail | active |
    Then the response status should be 422
    And the validation error for "email" should be "is invalid"

  Scenario: Update a user
    When I update user 1 with:
      | name             | gender | email            | status |
      | Augusta Ada King | female | ada@example.test | active |
    Then the response status should be 200
    And the user response should contain:
      | name             | gender | email            | status |
      | Augusta Ada King | female | ada@example.test | active |

  Scenario: Partially update a user
    When I partially update user 2 with:
      | status |
      | active |
    Then the response status should be 200
    And the response field "status" should be "active"
    And the response field "name" should be "Alan Turing"

  Scenario: Reject deletion without valid authorization
    When I delete user 1 without valid authorization
    Then the response status should be 401
    And the error message should be "Invalid token"
