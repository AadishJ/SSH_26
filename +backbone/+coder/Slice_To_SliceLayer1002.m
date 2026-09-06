classdef Slice_To_SliceLayer1002 < nnet.layer.Layer & nnet.layer.Formattable
    % A custom layer auto-generated while importing an ONNX network.
    %#codegen

    %#ok<*PROPLC>
    %#ok<*NBRAK>
    %#ok<*INUSL>
    %#ok<*VARARG>
    properties (Learnable)
    end

    properties (State)
    end

    properties
        Vars
        NumDims
    end

    methods(Static, Hidden)
        % Specify the properties of the class that will not be modified
        % after the first assignment.
        function p = matlabCodegenNontunableProperties(~)
            p = {
                % Constants, i.e., Vars, NumDims and all learnables and states
                'Vars'
                'NumDims'
                };
        end
    end


    methods(Static, Hidden)
        % Instantiate a codegenable layer instance from a MATLAB layer instance
        function this_cg = matlabCodegenToRedirected(mlInstance)
            this_cg = backbone.coder.Slice_To_SliceLayer1002(mlInstance);
        end
        function this_ml = matlabCodegenFromRedirected(cgInstance)
            this_ml = backbone.Slice_To_SliceLayer1002(cgInstance.Name);
            if isstruct(cgInstance.Vars)
                names = fieldnames(cgInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this_ml.Vars.(fieldname) = dlarray(cgInstance.Vars.(fieldname));
                end
            else
                this_ml.Vars = [];
            end
            this_ml.NumDims = cgInstance.NumDims;
        end
    end

    methods
        function this = Slice_To_SliceLayer1002(mlInstance)
            this.Name = mlInstance.Name;
            this.OutputNames = {'onnx__Add_437'};
            if isstruct(mlInstance.Vars)
                names = fieldnames(mlInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this.Vars.(fieldname) = backbone.coder.ops.extractIfDlarray(mlInstance.Vars.(fieldname));
                end
            else
                this.Vars = [];
            end

            this.NumDims = mlInstance.NumDims;
        end

        function [onnx__Add_437] = predict(this, onnx__Slice_613__)
            if isdlarray(onnx__Slice_613__)
                onnx__Slice_613_ = stripdims(onnx__Slice_613__);
            else
                onnx__Slice_613_ = onnx__Slice_613__;
            end
            onnx__Slice_613NumDims = 4;
            onnx__Slice_613 = backbone.coder.ops.permuteInputVar(onnx__Slice_613_, [4 3 1 2], 4);

            [onnx__Add_437__, onnx__Add_437NumDims__] = Slice_To_SliceGraph1004(this, onnx__Slice_613, onnx__Slice_613NumDims, false);
            onnx__Add_437_ = backbone.coder.ops.permuteOutputVar(onnx__Add_437__, [3 4 2 1], 4);

            onnx__Add_437 = dlarray(single(onnx__Add_437_), 'SSCB');
        end

        function [onnx__Add_437, onnx__Add_437NumDims1005] = Slice_To_SliceGraph1004(this, onnx__Slice_613, onnx__Slice_613NumDims, Training)

            % Execute the operators:
            % Slice:
            [indices1004, onnx__Slice_432NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_613, this.Vars.onnx__Slice_429, this.Vars.onnx__Slice_430, this.Vars.onnx__Slice_428, this.Vars.onnx__Slice_431, coder.const(onnx__Slice_613NumDims));
            onnx__Slice_432 = onnx__Slice_613(indices1004{:});

            % Slice:
            [indices1005, onnx__Add_437NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_432, this.Vars.onnx__Slice_434, this.Vars.onnx__Slice_435, this.Vars.onnx__Slice_433, this.Vars.onnx__Slice_436, coder.const(onnx__Slice_432NumDims));
            onnx__Add_437 = onnx__Slice_432(indices1005{:});

            % Set graph output arguments
            onnx__Add_437NumDims1005 = coder.const(onnx__Add_437NumDims);

        end

    end

end