import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Person } from '../person/entities/person.entity';
import { CreatePersonDto } from '../person/dto/create-person.dto';
import { UpdatePersonDto } from '../person/dto/update-person.dto';

export const ApiDocs = {
    createPerson: {
        operation: ApiOperation({ 
            summary: 'Create a new person',
            description: 'Creates a new person with the provided details. The email must be unique.'
        }),
        body: ApiBody({ 
            type: CreatePersonDto,
            examples: {
                example1: {
                    summary: 'Create a new person',
                    value: {
                        mail: "john.doe@example.com",
                        firstname: "John",
                        surname: "Doe",
                        password: "securePassword123",
                        numberPhone: "+33612345678",
                        idRole: 1
                    }
                }
            }
        }),
        responses: {
            success: ApiResponse({ 
                status: 201, 
                description: 'The person has been successfully created.',
                type: Person,
                examples: {
                    example1: {
                        summary: 'Successfully created person',
                        value: {
                            idPerson: 1,
                            mail: "john.doe@example.com",
                            firstname: "John",
                            surname: "Doe",
                            numberPhone: "+33612345678",
                            idRole: 1
                        }
                    }
                }
            }),
            error: ApiResponse({ 
                status: 400, 
                description: 'Bad request. The email might already exist or required fields are missing.',
                examples: {
                    example1: {
                        summary: 'Email already exists',
                        value: {
                            statusCode: 400,
                            message: "Email already exists",
                            error: "Bad Request"
                        }
                    }
                }
            })
        }
    },

    findAllPersons: {
        operation: ApiOperation({ 
            summary: 'Get all persons',
            description: 'Retrieves a list of all persons in the system.'
        }),
        response: ApiResponse({ 
            status: 200, 
            description: 'List of all persons retrieved successfully.',
            type: [Person],
            examples: {
                example1: {
                    summary: 'List of persons',
                    value: [
                        {
                            idPerson: 1,
                            mail: "john.doe@example.com",
                            firstname: "John",
                            surname: "Doe",
                            numberPhone: "+33612345678",
                            idRole: 1
                        },
                        {
                            idPerson: 2,
                            mail: "jane.smith@example.com",
                            firstname: "Jane",
                            surname: "Smith",
                            numberPhone: "+33687654321",
                            idRole: 2
                        }
                    ]
                }
            }
        })
    },

    findOnePerson: {
        operation: ApiOperation({ 
            summary: 'Get a person by ID',
            description: 'Retrieves a specific person by their ID.'
        }),
        param: ApiParam({ 
            name: 'id', 
            description: 'The ID of the person to retrieve',
            type: 'number',
            example: 1
        }),
        responses: {
            success: ApiResponse({ 
                status: 200, 
                description: 'The person was found and returned successfully.',
                type: Person,
                examples: {
                    example1: {
                        summary: 'Person found',
                        value: {
                            idPerson: 1,
                            mail: "john.doe@example.com",
                            firstname: "John",
                            surname: "Doe",
                            numberPhone: "+33612345678",
                            idRole: 1
                        }
                    }
                }
            }),
            error: ApiResponse({ 
                status: 404, 
                description: 'Person with the specified ID was not found.',
                examples: {
                    example1: {
                        summary: 'Person not found',
                        value: {
                            statusCode: 404,
                            message: "Person with ID 1 not found",
                            error: "Not Found"
                        }
                    }
                }
            })
        }
    },

    updatePerson: {
        operation: ApiOperation({ 
            summary: 'Update a person',
            description: 'Updates the details of an existing person.'
        }),
        param: ApiParam({ 
            name: 'id', 
            description: 'The ID of the person to update',
            type: 'number',
            example: 1
        }),
        body: ApiBody({ 
            type: UpdatePersonDto,
            examples: {
                example1: {
                    summary: 'Update person details',
                    value: {
                        firstname: "Johnny",
                        surname: "Doe",
                        numberPhone: "+33612345678",
                        idRole: 2
                    }
                }
            }
        }),
        responses: {
            success: ApiResponse({ 
                status: 200, 
                description: 'The person was updated successfully.',
                type: Person,
                examples: {
                    example1: {
                        summary: 'Person updated',
                        value: {
                            idPerson: 1,
                            mail: "john.doe@example.com",
                            firstname: "Johnny",
                            surname: "Doe",
                            numberPhone: "+33612345678",
                            idRole: 2
                        }
                    }
                }
            }),
            error: ApiResponse({ 
                status: 404, 
                description: 'Person with the specified ID was not found.',
                examples: {
                    example1: {
                        summary: 'Person not found',
                        value: {
                            statusCode: 404,
                            message: "Person with ID 1 not found",
                            error: "Not Found"
                        }
                    }
                }
            })
        }
    },

    removePerson: {
        operation: ApiOperation({ 
            summary: 'Delete a person',
            description: 'Removes a person from the system.'
        }),
        param: ApiParam({ 
            name: 'id', 
            description: 'The ID of the person to delete',
            type: 'number',
            example: 1
        }),
        responses: {
            success: ApiResponse({ 
                status: 200, 
                description: 'The person was deleted successfully.',
                examples: {
                    example1: {
                        summary: 'Person deleted',
                        value: {
                            message: "Person deleted successfully"
                        }
                    }
                }
            }),
            error: ApiResponse({ 
                status: 404, 
                description: 'Person with the specified ID was not found.',
                examples: {
                    example1: {
                        summary: 'Person not found',
                        value: {
                            statusCode: 404,
                            message: "Person with ID 1 not found",
                            error: "Not Found"
                        }
                    }
                }
            })
        }
    }
}; 